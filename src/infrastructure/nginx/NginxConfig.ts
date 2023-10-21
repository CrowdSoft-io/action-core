export type NginxHtmlService = {
  readonly type: "html";
};

export type NginxPhpService = {
  readonly type: "php";
  readonly options: {
    readonly version: string;
  };
};

export type NginxProxyService = {
  readonly type: "proxy";
  readonly options: {
    readonly pass: string;
  };
};

export type NginxService = NginxHtmlService | NginxPhpService | NginxProxyService;

export type NginxLocation = {
  readonly path: string;
  readonly basic_auth?: boolean;
  readonly cors_headers?: boolean;
  readonly service: NginxService;
};

export type NginxGatewayServiceName = string;

export type NginxGateway = {
  readonly services: Array<{
    readonly name: NginxGatewayServiceName;
    readonly base_url: string;
  }>;
  readonly schema: Array<{
    readonly from: string;
    readonly to: string;
    readonly service: NginxGatewayServiceName;
    readonly basic_auth?: boolean;
  }>;
};

export type NginxUpstream = {
  readonly name: string;
  readonly servers: Array<string>;
};

export type NginxServer = {
  readonly strict?: boolean;
  readonly locations?: Array<NginxLocation>;
  readonly with_www?: boolean;
  readonly gateway?: NginxGateway;
  readonly upstreams?: Array<NginxUpstream>;
};

export interface NginxConfig {
  readonly external?: NginxServer;
  readonly internal?: NginxServer;
}
