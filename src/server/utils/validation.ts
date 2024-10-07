import { body } from "express-validator";

export const validateAssetEntry = [
  body("date")
    .isISO8601()
    .toDate()
    .withMessage("日付は有効なISO8601形式である必要があります"),
  body("value").isNumeric().withMessage("資産価値は数値である必要があります"),
  body("account").notEmpty().withMessage("口座は必須です"),
];

// 他のバリデーション関数も同様に実装
