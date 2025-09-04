// CJS-friendly lazy schema loader for Bug
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../_lib/mongo');
let cachedModel: any = null;

async function ensureBugModel(): Promise<any> {
  if (cachedModel) return cachedModel;
  const m = mongoLib.mongoose || (mongoLib.getMongoose ? await mongoLib.getMongoose() : null);
  if (!m) throw new Error('Mongoose unavailable');
  const existing = m.models?.Bug;
  if (existing) {
    cachedModel = existing;
    return cachedModel;
  }
  const schema = new m.Schema(
    {
      title: { type: String, required: true },
      description: { type: String },
      featureId: { type: String, index: true, required: true },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
      status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open',
      },
    },
    { timestamps: true, strict: false }
  );
  cachedModel = m.model('Bug', schema, 'bugs');
  return cachedModel;
}

module.exports = { ensureBugModel };
