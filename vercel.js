{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node",
      "config": { "zeroConfig": true }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/index.ts"
    },
    {
      "src": "/webhook/(.*)",
      "dest": "src/index.ts"
    },
    {
      "src": "/$",
      "dest": "src/index.ts"
    }
  ]
}
