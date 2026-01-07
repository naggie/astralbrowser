{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js and npm for building the JavaScript application
    nodejs_20
    
    # nginx for serving the demo
    nginx

    python313Packages.faker
  ];

  shellHook = ''
    echo "Astralbrowser demo environment loaded"
    echo ""
    echo "Available commands:"
    echo "  make demo    - Build and start the demo server"
    echo "  make build   - Build the JavaScript application"
    echo ""
    echo "Dependencies:"
    echo "  Node.js: $(node --version)"
    echo "  npm: $(npm --version)"
    echo "  nginx: $(nginx -v 2>&1)"
    echo ""
  '';
}
