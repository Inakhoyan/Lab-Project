"use strict";

class Url {
  constructor(url) {
    if (url instanceof URL) {
      item = url;
    } else if (typeof url === "string") {
      if (url.indexOf("//") === -1) {
        url = "http://" + url;
      }
    } else {
      this.href = url.href;
      this.host = url.host;
      this.path = url.path;
      return;
    }

    let item = new URL(url);

    this.href = item.href;
    this.host = item.hostname;
    this.path = item.pathname === "/" ? "" : item.pathname;
  }

  isMatch(url) {
    if (!url) {
      return false;
    }

    try {
      url = url instanceof Url ? url : new Url(url);
    } catch {
      return false;
    }

    return this.isHostMatch(url.host) && this.isPathMatch(url.path);
  }

  isHostMatch(host) {
    if (host === this.host) {
      return true;
    }

    let thisHostParts = this.host.split(".").reverse();

    let hostParts = host.split(".").reverse();

    let result = thisHostParts.every((part, i) => hostParts[i] === part);
    
    return result;
  }

  isPathMatch(path) {
    let result = this.path === '' || path === this.path  || path.indexOf(this.path) === 0;

    return result;
  }

  getId() {
    return this.host + this.path.replace(/\//g, "-");
  }

  toString() {
    return this.host + this.path;
  }
}
