(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.download = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  return function download(data, strFileName, strMimeType) {

    const self = window; 
    const defaultMime = "application/octet-stream"; 
    const mimeType = strMimeType || defaultMime;
    let payload = data;
    const url = !strFileName && !strMimeType && payload;
    const anchor = document.createElement("a");
    const toString = function(a) { return String(a); };
    let myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString);
    let fileName = strFileName || "download";
    let blob;
    let reader;
    myBlob = myBlob.call ? myBlob.bind(self) : Blob;
  
    if (String(this) === "true") {
      payload = [payload, mimeType];
      mimeType = payload[0];
      payload = payload[1];
    }

    if (url && url.length < 2048) {
      fileName = url.split("/").pop().split("?")[0];
      anchor.href = url;
      const ajax = new XMLHttpRequest();
      ajax.open("GET", url, true);
      ajax.responseType = 'blob';
      ajax.onload = function (e) {
        download(e.target.response, fileName, defaultMime);
      };
      setTimeout(function () { ajax.send(); }, 0);
      return ajax;
    }

    if (/^data:([\w+-]+\/[\w+.-]+)?[,;]/.test(payload)) {
      if (payload.length > (1024 * 1024 * 1.999) && myBlob !== toString) {
        payload = dataUrlToBlob(payload);
        mimeType = payload.type || defaultMime;
      } else {
        return navigator.msSaveBlob ? navigator.msSaveBlob(dataUrlToBlob(payload), fileName) : saver(payload);
      }
    } else {
      if (/([\x80-\xff])/.test(payload)) {
        const tempUiArr = new Uint8Array(payload.length);
        for (let i = 0, mx = tempUiArr.length; i < mx; ++i) tempUiArr[i] = payload.charCodeAt(i);
        payload = new myBlob([tempUiArr], { type: mimeType });
      }
    }
    blob = payload instanceof myBlob ? payload : new myBlob([payload], { type: mimeType });

    function dataUrlToBlob(strUrl) {
      const parts = strUrl.split(/[:;,]/),
        type = parts[1],
        indexDecoder = strUrl.indexOf("charset") > 0 ? 3 : 2,
        decoder = parts[indexDecoder] == "base64" ? atob : decodeURIComponent,
        binData = decoder(parts.pop()),
        uiArr = new Uint8Array(binData.length);

      for (let i = 0; i < binData.length; ++i) uiArr[i] = binData.charCodeAt(i);

      return new myBlob([uiArr], { type: type });
    }

    function saver(url, winMode) {
      if ('download' in anchor) {
        anchor.href = url;
        anchor.setAttribute("download", fileName);
        anchor.className = "download-js-link";
        anchor.style.display = "none";
        anchor.addEventListener('click', function (e) {
          e.stopPropagation();
          this.removeEventListener('click', arguments.callee);
        });
        document.body.appendChild(anchor);
        setTimeout(function () {
          anchor.click();
          document.body.removeChild(anchor);
          if (winMode === true) { setTimeout(function () { self.URL.revokeObjectURL(anchor.href); }, 250); }
        }, 66);
        return true;
      }

      const f = document.createElement("iframe");
      document.body.appendChild(f);
      if (!winMode && /^data:/.test(url)) {
        url = `data:${url.replace(/^data:([\w\/\-\+]+)/, '')}`;
      }
      f.src = url;
      setTimeout(function () { document.body.removeChild(f); }, 333);
    }

    if (navigator.msSaveBlob) {
      return navigator.msSaveBlob(blob, fileName);
    }

    if (self.URL) {
      saver(self.URL.createObjectURL(blob), true);
    } else {
      if (typeof blob === "string" || blob.constructor === toString) {
        try {
          return saver(`data:${mimeType};base64,${self.btoa(blob)}`);
        } catch (y) {
          return saver(`data:${mimeType},${encodeURIComponent(blob)}`);
        }
      }

      reader = new FileReader();
      reader.onload = function () {
        saver(this.result);
      };
      reader.readAsDataURL(blob);
    }
    return true;
  };
}));