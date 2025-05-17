# TypeScript Type Mismatch Report
Generated on: Sat 17 May 2025 05:33:10 PM UTC

## Type Mismatch Errors

### Type Comparison Errors (TS2367)

- `server/routes.ts(1016,9): error TS2367: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.`

### Argument Type Mismatch Errors (TS2345)

- `server/storage.ts(371,26): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`
- `server/storage.ts(377,26): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`
- `server/storage.ts(383,26): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`
- `server/storage.ts(389,26): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`
- `server/storage.ts(395,26): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.`

### Other Type Mismatch Errors

- `server/storage.ts(324,67): error TS2769: No overload matches this call.`

## Potential Type Conversion Locations

### String-Number Conversion Functions

- `server/services/image-storage.ts:86:  return buffer.toString('base64');`
- `server/services/subject-recommendation.ts:5:  0: ['Alphabet', 'Numbers', 'Colors', 'Shapes', 'Basic Vocabulary', 'Social Skills'],`
- `server/services/subject-recommendation.ts:23:  'Mathematics': ['Numbers', 'Basic Math', 'Math', 'Pre-Algebra', 'Algebra', 'Geometry', 'Algebra II', 'Precalculus', 'Calculus'],`
- `server/middleware/auth.ts:64:  const salt = randomBytes(16).toString("hex");`
- `server/middleware/auth.ts:66:  return `${buf.toString("hex")}.${salt}`;`
- `server/config/env.ts:36:export const PORT = parseInt(getEnv('PORT', '5000'));`
- `server/index.ts:8:const PORT = Number(process.env.PORT || 5000);`
- `server/index.ts:9:const HTTP_PORT = Number(process.env.HTTP_PORT || 8000);`
- `server/utils.ts:12:  1: ["Numbers", "Letters", "Colors", "Shapes"],`
- `server/utils.ts:195:    "Numbers": "Numbers are the building blocks of mathematics. We use them to count, measure, and understand the world around us.",`
- `server/utils.ts:329:    case "Numbers":`
- `server/content-generator.ts:194:        content += `- Numbers represent quantities and can be added, subtracted, multiplied, and divided\n`;`
- `server/content-generator.ts:618:  return crypto.randomBytes(length).toString('hex');`
- `server/storage.ts:197:      const result = await db.select().from(users).where(eq(users.parentId, Number(Number(parentId))));`
- `server/storage.ts:303:        userId: typeof profile.userId === "string" ? Number(profile.userId) : profile.userId`
- `server/storage.ts:336:      const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;`
- `server/storage.ts:551:          .where(and(eq(lessons.learnerId, Number(Number(learnerId))), eq(lessons.status, "ACTIVE")));`
- `server/storage.ts:573:        .where(and(eq(lessons.learnerId, Number(Number(learnerId))), eq(lessons.status, "ACTIVE")));`
- `server/storage.ts:601:      const learnerIdNum = typeof learnerId === 'string' ? parseInt(learnerId) : learnerId;`
- `server/storage.ts:611:        .where(eq(lessons.learnerId, Number(Number(learnerIdNum))))`
- `server/storage.ts:628:          .where(eq(lessons.learnerId, Number(Number(learnerId))))`
- `server/storage.ts:654:        .where(eq(lessons.learnerId, Number(Number(learnerId))))`
- `server/storage.ts:751:      .where(eq(achievements.learnerId, learnerId.toString()))`
- `server/storage.ts:761:      .where(eq(dbSyncConfigs.parentId, parentId.toString()));`
- `server/storage.ts:843:          await db.delete(learnerProfiles).where(eq(learnerProfiles.userId, Number(Number(id))));`
- `server/storage.ts:847:        await db.delete(lessons).where(eq(lessons.learnerId, Number(Number(id))));`
- `server/storage.ts:850:        await db.delete(achievements).where(eq(achievements.learnerId, id.toString()));`
- `server/storage.ts:870:function toNumber(userId: string | number | null | undefined): number {`
- `server/storage.ts:875:  const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;`
- `server/routes.ts:17:function toNumber(id: string | number | null | undefined): number {`
- `server/routes.ts:20:  const num = parseInt(id);`
- `server/routes.ts:206:      const timestamp = Date.now().toString().slice(-6);`
- `server/routes.ts:236:              parseInt(req.body.gradeLevel) : req.body.gradeLevel;`
- `server/routes.ts:284:            username: req.body.name.toLowerCase().replace(/\s+/g, '-') + '-' + timestamp.toString().slice(-6),`
- `server/routes.ts:289:            password: req.body.password || "temppass" + timestamp.toString().slice(-6)`
- `server/routes.ts:299:                parseInt(req.body.gradeLevel) : req.body.gradeLevel;`
- `server/routes.ts:385:            userId: Number(userId),`
- `server/routes.ts:440:        const parentResult = await pool.query(parentQuery, [userId, toNumber(req.user.id)]);`
- `server/routes.ts:466:          gradeLevelNum = parseInt(gradeLevel.toString());`
- `server/routes.ts:494:          Number(userId),`
- `server/routes.ts:508:            userId: Number(userId),`
- `server/routes.ts:633:          Number(userId),`
- `server/routes.ts:664:            userId: Number(userId),`
- `server/routes.ts:737:        learnerId: Number(req.user.id),`
- `server/routes.ts:884:              learnerId: Number(targetLearnerId),`
- `server/routes.ts:926:        learnerId: Number(targetLearnerId),`
- `server/routes.ts:959:      req.user.id.toString() === lesson.learnerId.toString() ||`
- `server/routes.ts:992:    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;`
- `server/routes.ts:1016:    if (lesson.learnerId !== req.user.id.toString()) {`
- `server/routes.ts:1050:        learnerId: req.user.id.toString(),`
- `server/routes.ts:1136:          learnerId: Number(req.user.id),`

## Summary

Total type mismatch errors found: 7
