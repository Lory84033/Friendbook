var N="fb14-v2",F=["./","index.html","lite.html","app.js","config.js","manifest.json","icon-192.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(N).then(function(c){return c.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!=N}).map(function(x){return caches.delete(x)}))}))});
self.addEventListener("fetch",function(e){var r=e.request;if(r.method!="GET"||new URL(r.url).origin!=location.origin)return;
e.respondWith(fetch(r).then(function(s){var c=s.clone();caches.open(N).then(function(h){h.put(r,c)});return s}).catch(function(){return caches.match(r)}))});
