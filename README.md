This is an AJAX file browser that uses an nginx autoindex configured in JSON
mode, as well as a streaming client-side search engine that uses an index
downloaded from the server.

## Demo

To run a demo of astralbrowser with a sample file tree:

```bash
make demo
```

This will:
1. Compile the JavaScript application
2. Start nginx on port 8080 (non-root, HTTP only) with JSON autoindex enabled
3. Serve the application at http://localhost:8080/
4. Serve a demo file tree at http://localhost:8080/demotree/

The nginx server runs in non-daemon mode, so press Ctrl+C to stop it.

