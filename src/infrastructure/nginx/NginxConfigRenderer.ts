import { Injectable } from "@tsed/di";
import { Context } from "../../models";
import { NginxLocation, NginxPhpService, NginxProxyService, NginxServer, NginxService } from "./NginxConfig";

@Injectable()
export class NginxConfigRenderer {
  renderServer(context: Context, server: NginxServer, domain: string, external = false, withWww = false): string {
    const lines: Array<string> = [];

    lines.push("server {");

    lines.push("    client_max_body_size 50M;");
    lines.push("");

    lines.push(`    server_name ${domain};`);
    lines.push("");

    lines.push(`    access_log /var/log/nginx/${domain}.access.log;`);
    lines.push(`    error_log  /var/log/nginx/${domain}.error.log;`);
    lines.push("");

    for (const location of server.locations) {
      lines.push(...this.renderLocation(context, location));
      lines.push("");
    }

    const location = server.locations.find((location) => location.service.type === "php");
    if (location) {
      lines.push(...this.renderFastCgiPhpLocation(context, location.service as NginxPhpService));
      lines.push("");
    }

    if (external) {
      lines.push(`    ssl_certificate         /etc/letsencrypt/live/${domain}/fullchain.pem;`);
      lines.push(`    ssl_certificate_key     /etc/letsencrypt/live/${domain}/privkey.pem;`);
      lines.push(`    ssl_trusted_certificate /etc/letsencrypt/live/${domain}/chain.pem;`);
      lines.push("");
    }

    if (external) {
      lines.push("    listen 443 ssl;");
      lines.push("    listen [::]:443 ssl;");
    } else if (context.branch === "main") {
      lines.push("    listen 127.0.0.1:80;");
    } else {
      lines.push("    listen 80;");
      lines.push("    listen [::]:80;");
    }
    lines.push("");

    lines.push("}");
    lines.push("");

    if (external) {
      lines.push(...this.renderExternalRedirects(domain, withWww));
    }

    return lines.join("\n");
  }

  private renderExternalRedirects(domain: string, withWww: boolean): Array<string> {
    const lines: Array<string> = [];

    if (withWww) {
      lines.push("server {");
      lines.push(`    server_name www.${domain};`);
      lines.push(`    access_log /var/log/nginx/www.${domain}.access.log;`);
      lines.push(`    error_log  /var/log/nginx/www.${domain}.error.log;`);
      lines.push("");
      lines.push(`    if ($host = www.${domain}) {`);
      lines.push(`        return 301 https://${domain}$request_uri;`);
      lines.push("    }");
      lines.push("");
      lines.push(`    ssl_certificate     /etc/letsencrypt/live/www.${domain}/fullchain.pem;`);
      lines.push(`    ssl_certificate_key /etc/letsencrypt/live/www.${domain}/privkey.pem;`);
      lines.push("    include             /etc/letsencrypt/options-ssl-nginx.conf;");
      lines.push("    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;");
      lines.push("");
      lines.push("    listen 443 ssl;");
      lines.push("    listen [::]:443 ssl;");
      lines.push("");
      lines.push("    return 404;");
      lines.push("}");
      lines.push("");
    }

    lines.push("server {");
    lines.push(`    server_name ${domain};`);
    lines.push(`    access_log /var/log/nginx/${domain}-80.access.log;`);
    lines.push(`    error_log  /var/log/nginx/${domain}-80.error.log;`);
    lines.push("");
    lines.push(`    if ($host = ${domain}) {`);
    lines.push(`        return 301 https://${domain}$request_uri;`);
    lines.push("    }");
    lines.push("");
    lines.push("    listen 80;");
    lines.push("    listen [::]:80;");
    lines.push("");
    lines.push("    return 404;");
    lines.push("}");
    lines.push("");

    if (withWww) {
      lines.push("server {");
      lines.push(`    server_name www.${domain};`);
      lines.push(`    access_log /var/log/nginx/www.${domain}-80.access.log;`);
      lines.push(`    error_log  /var/log/nginx/www.${domain}-80.error.log;`);
      lines.push("");
      lines.push(`    if ($host = www.${domain}) {`);
      lines.push(`        return 301 https://${domain}$request_uri;`);
      lines.push("    }");
      lines.push("");
      lines.push("    listen 80;");
      lines.push("    listen [::]:80;");
      lines.push("");
      lines.push("    return 404;");
      lines.push("}");
      lines.push("");
    }

    return lines;
  }

  private renderLocation(context: Context, location: NginxLocation): Array<string> {
    const lines: Array<string> = [];

    lines.push(`    location ${location.path} {`);
    if (location.basic_auth) {
      lines.push('        auth_basic           "Restricted Content";');
      lines.push("        auth_basic_user_file /etc/nginx/.htpasswd;");
      lines.push("");
    }
    lines.push(...this.renderService(context, location.service));
    lines.push("    }");

    return lines;
  }

  private renderFastCgiPhpLocation(context: Context, service: NginxPhpService): Array<string> {
    const lines: Array<string> = [];

    lines.push("    location ~ .php$ {");
    lines.push(`        root         ${context.remote.projectRoot}/public;`);
    lines.push("        include      snippets/fastcgi-php.conf;");
    lines.push(`        fastcgi_pass unix:/var/run/php/php${service.options.version}-fpm-${context.projectName}.sock;`);
    lines.push("    }");

    return lines;
  }

  private renderService(context: Context, service: NginxService): Array<string> {
    switch (service.type) {
      case "html":
        return this.renderHtmlService(context);
      case "php":
        return this.renderPhpService(context);
      case "proxy":
        return this.renderProxyService(service);
    }

    return [];
  }

  private renderHtmlService(context: Context): Array<string> {
    const lines: Array<string> = [];

    lines.push("        index     index.html;");
    lines.push(`        root      ${context.remote.projectRoot};`);
    lines.push("        try_files $uri $uri/ /index.html;");

    return lines;
  }

  private renderPhpService(context: Context): Array<string> {
    const lines: Array<string> = [];

    lines.push("        index     index.php;");
    lines.push(`        root      ${context.remote.projectRoot}/public;`);
    lines.push("        try_files $uri $uri/ /index.php$is_args$args;");

    return lines;
  }

  private renderProxyService(service: NginxProxyService): Array<string> {
    const lines: Array<string> = [];

    lines.push(`        proxy_pass         ${service.options.pass};`);
    lines.push("        proxy_http_version 1.1;");
    lines.push("        proxy_set_header   Upgrade $http_upgrade;");
    lines.push("        proxy_set_header   Connection 'upgrade';");
    lines.push("        proxy_set_header   Host $host;");
    lines.push("        proxy_set_header   X-Real-IP $remote_addr;");
    lines.push("        proxy_set_header   X-Forwarded-Proto $scheme;");
    lines.push("        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;");
    lines.push("        proxy_cache_bypass $http_upgrade;");

    return lines;
  }
}
