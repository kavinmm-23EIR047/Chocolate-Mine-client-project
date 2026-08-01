const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes("require('../services/excelService')")) return;
  if (!content.includes('async function(doc)')) return;

  const modelNameMatch = content.match(/module\.exports = mongoose\.model\('([^']+)'/);
  if (!modelNameMatch) return;
  const schemaVarMatch = content.match(/([a-zA-Z0-9_]+Schema)\.post/);
  if (!schemaVarMatch) return;

  const schemaVar = schemaVarMatch[1];

  const replacement = `
// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

${schemaVar}.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || '${modelNameMatch[1]}';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

${schemaVar}.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || '${modelNameMatch[1]}';
  const query = typeof this.getQuery === 'function' ? this.getQuery() : null;
  
  (async () => {
    try {
      if (doc && doc._id) {
        await excelService.updateInExcel(modelName, doc._id, doc);
      } else if (query && query._id) {
        const updatedDoc = await this.model.findOne(query).lean();
        if (updatedDoc) await excelService.updateInExcel(modelName, query._id, updatedDoc);
      }
    } catch (err) {
      console.error("Excel sync error for update:", err.message);
    }
  })();
});

${schemaVar}.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || '${modelNameMatch[1]}';
  const query = typeof this.getQuery === 'function' ? this.getQuery() : null;
  
  (async () => {
    try {
      if (doc && doc._id) {
        await excelService.deleteFromExcel(modelName, doc._id);
      } else if (query && query._id) {
        await excelService.deleteFromExcel(modelName, query._id);
      }
    } catch (err) {
      console.error("Excel sync error for delete:", err.message);
    }
  })();
});

module.exports = mongoose.model('${modelNameMatch[1]}', ${schemaVar});`;

  // Use a simple regex to replace everything from the excel require down to the module.exports
  content = content.replace(
    /\/\/ ==========================================\s*\n\/\/ Excel Synchronization Hooks[\s\S]*module\.exports = mongoose\.model\('[^']+', [^)]+\);\s*$/,
    replacement.trim() + '\n'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', file);
});
