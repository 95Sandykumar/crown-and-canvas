// Crown & Canvas — order fulfillment worker (PM2)
//
// Review-gate mode: every 5 minutes this generates portraits for any NEW paid
// order (Nano Banana Pro + exact styles.ts prompt) and emails them to the owner
// for review. It does NOT email customers automatically.
//
// To deliver an approved order to the customer (manual gate):
//   node scripts/fulfill-orders.mjs --list-pending
//   node scripts/fulfill-orders.mjs --approve=<sessionId>
//   node scripts/fulfill-orders.mjs --approve-all
//
// Start:  pm2 start ecosystem.fulfill.cjs && pm2 save
// Logs:   pm2 logs crown-fulfill   (also ./orders/fulfill.log)
// Stop:   pm2 stop crown-fulfill

module.exports = {
  apps: [
    {
      name: "crown-fulfill",
      script: "scripts/fulfill-orders.mjs",
      interpreter: "node",
      cwd: __dirname,
      autorestart: false,        // short-lived script; cron relaunches it
      cron_restart: "*/5 * * * *", // every 5 minutes
      out_file: "./orders/fulfill.log",
      error_file: "./orders/fulfill.err.log",
      time: true,
    },
  ],
};
