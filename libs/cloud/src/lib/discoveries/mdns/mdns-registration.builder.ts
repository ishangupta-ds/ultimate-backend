/*******************************************************************************
 * Copyright (c) 2021. Rex Isaac Raphael
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * File name:         mdns-registration.builder.ts
 * Last modified:     11/02/2021, 00:22
 ******************************************************************************/

import * as uuid from 'uuid';

import { MdnsDiscoveryOptions } from './interfaces';
import { MdnsRegistration } from './mdns-registration';
import {
  HeartbeatOptions,
  IpUtils,
  PlainObjectString,
  RegistrationBuilder,
} from '@ultimate-backend/common';
import { Service } from 'bonjour';

export class MdnsRegistrationBuilder implements RegistrationBuilder {
  private _serviceName: string | undefined;
  private _port: number | undefined;
  private _host: string | undefined;
  private _tags: string[];
  private _status: string;
  private _version: string;
  private _domain: string | undefined;
  private _meta: PlainObjectString | undefined;
  private _instanceId: string | undefined;
  private _heartbeatOptions: HeartbeatOptions | undefined;
  private _discoveryOptions: MdnsDiscoveryOptions | undefined;

  constructor(host?: string, port?: number) {
    this._host = host;
    this._port = port;
  }

  version(version: string): RegistrationBuilder {
    this._version = version || 'latest';
    return this;
  }

  status(status: string): RegistrationBuilder {
    this._status = status;
    return this;
  }

  discoveryOptions(properties: MdnsDiscoveryOptions): RegistrationBuilder {
    this._discoveryOptions = properties;
    return this;
  }

  heartbeatOptions(properties: HeartbeatOptions): RegistrationBuilder {
    this._heartbeatOptions = properties;
    return this;
  }

  host(host: string): RegistrationBuilder {
    this._host = host;
    return this;
  }

  instanceId(id: string): RegistrationBuilder {
    this._instanceId = id;
    return this;
  }

  port(port: number): RegistrationBuilder {
    this._port = port;
    return this;
  }

  domain(domain: string): RegistrationBuilder {
    this._domain = domain;
    return this;
  }

  serviceName(name: string): RegistrationBuilder {
    this._serviceName = name;
    return this;
  }

  build(): MdnsRegistration {
    if (!this._serviceName) {
      throw Error('serviceName is required');
    }

    if (!this._host) {
      this._host = IpUtils.getIpAddress();
    }

    if (!this._port) {
      throw Error('port is required');
    }

    const scheme = this._discoveryOptions?.scheme || 'http';
    const isSecure = scheme == 'https';

    if (!this._instanceId) {
      this._instanceId = `${this._serviceName}-${this._version}-${uuid.v4()}`;
    } else {
      this._instanceId = `${this._instanceId}-${this._version}`;
    }

    const meta = Object.assign(
      {},
      {
        domain: this._domain,
        version: this._version,
        secure: `${isSecure}`,
        serviceId: this._instanceId,
      },
      this._meta
    );

    if (this._status) {
      meta[status] = this._status;
    }

    const newService: Partial<Service> = {
      name: this._serviceName,
      port: this._port,
      host: this._host,
      txt: meta,
    };

    return new MdnsRegistration(newService, this._discoveryOptions);
  }

  metadata(metadata: PlainObjectString): RegistrationBuilder {
    this._meta = metadata;
    return this;
  }

  tags(tags: string[]): RegistrationBuilder {
    this._tags = tags;
    return this;
  }
}
