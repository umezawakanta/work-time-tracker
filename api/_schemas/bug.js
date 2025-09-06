// CJS-friendly Bug model loader (avoids NodeNext issues)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoLib = require('../_lib/mongo');
let cached = null;

async function ensureBugModel() {
    if (cached) return cached;
    const m = mongoLib.mongoose || (mongoLib.getMongoose ? await mongoLib.getMongoose() : null);
    if (!m) throw new Error('Mongoose unavailable');
    cached = m.models.Bug || m.model(
        'Bug',
        new m.Schema(
            {
                title: { type: String, required: true, trim: true },
                description: { type: String },
                featureId: { type: String, required: true, index: true },
                severity: {
                    type: String,
                    enum: ['low', 'medium', 'high', 'critical'],
                    default: 'medium',
                    required: true,
                },
                status: {
                    type: String,
                    enum: ['open', 'in_progress', 'resolved', 'closed'],
                    default: 'open',
                    required: true,
                },
                createdBy: { type: String },
                source: { type: String, enum: ['client', 'server', 'manual'], default: 'manual', index: true },
                fingerprint: { type: String, index: true },
                occurrences: { type: Number, default: 1 },
                lastOccurredAt: { type: Date },
            },
            { timestamps: true }
        )
    );
    return cached;
}

module.exports = { ensureBugModel };


