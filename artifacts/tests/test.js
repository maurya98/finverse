const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 4000;

/**
 * Define dynamic routes here
 * Format: { method, path }
 * Use :paramName for dynamic segments
 */
const routes = [
  { method: "GET", path: "/users/:id" },
  { method: "POST", path: "/users/:id/orders/:orderId" },
  { method: "PUT", path: "/products/:productId" },
  { method: "DELETE", path: "/users/:id" },
];

/**
 * Match incoming request path against route pattern
 */
function matchRoute(method, pathname) {
  for (const route of routes) {
    if (route.method !== method) continue;

    const routeParts = route.path.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);

    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { matched: true, route: route.path, params };
    }
  }

  return { matched: false, route: null, params: {} };
}

const server = http.createServer((req, res) => {
  const { method, headers, socket, httpVersion } = req;

  const fullUrl = new URL(req.url, `http://${headers.host}`);
  const pathname = fullUrl.pathname;
  const queryParams = Object.fromEntries(fullUrl.searchParams.entries());

  const routeMatch = matchRoute(method, pathname);

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    let parsedBody = body;

    try {
      parsedBody = body ? JSON.parse(body) : null;
    } catch {
      // Keep raw if not JSON
    }

    const responsePayload = {
      success: true,
      timestamp: new Date().toISOString(),
      route: {
        definedRoute: routeMatch.route,
        matched: routeMatch.matched,
        params: routeMatch.params,
      },
      request: {
        method,
        url: req.url,
        pathname,
        query: queryParams,
        headers,
        ip: socket.remoteAddress,
        httpVersion,
        body: parsedBody,
      },
    };

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(responsePayload, null, 2));
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Dynamic Echo server running at http://localhost:${PORT}`);
});