const config = {
  test: {
    environment: "node",
    globals: false,
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/.next/**"]
  }
};

export default config;
