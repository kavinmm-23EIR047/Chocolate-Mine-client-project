const { execSync } = require('child_process');
try {
  execSync('git checkout frontend/src/pages/Checkout.jsx', { cwd: 'd:/chocolate-mine-final/Chocolate-Mine-client-project' });
  console.log('Success');
} catch (e) {
  console.error(e);
}
