import pool from "../config/database"

export type FeatureName = "checkout_enabled" | "chat_enabled" | "auction_enabled"

export type FlagScope = "ok" | "user" | "global"

export interface EffectiveFlag {
  enabled: boolean
  scope: FlagScope
  reason: string | null
}

// Insert / update 1 flag (global atau user) pakai UPSERT
export async function _updateFeatureFlag(params: {
  userId: number | null   // null = global
  featureName: FeatureName
  isEnabled: boolean
  reason?: string         // frontend kirim "" kalau enable
}) {
  const effectiveUserId = params.userId ?? 0
  const reason = params.reason ?? ""

  const res = await pool.query(
    `
      INSERT INTO user_feature_access (user_id, feature_name, is_enabled, reason)
      VALUES ($1, $2, $3, NULLIF($4, ''))
      ON CONFLICT (user_id, feature_name)
      DO UPDATE SET
        is_enabled = EXCLUDED.is_enabled,
        reason     = EXCLUDED.reason,
        updated_at = NOW()
      RETURNING user_id, feature_name, is_enabled, reason;
    `,
    [effectiveUserId, params.featureName, params.isEnabled, reason]
  )

  return res.rows[0]
}

/*
  Cek status efektif satu feature untuk satu user:
  1. Kalau global OFF  -> enabled = false, scope = "global"
  2. Kalau global ON, user OFF -> enabled = false, scope = "user"
  3. Selain itu        -> enabled = true,  scope = "ok"
*/
export async function _getEffectiveFeatureFlag(params: {
  userId: number | null
  featureName: FeatureName
}): Promise<EffectiveFlag> {
  const { userId, featureName } = params

  const res = await pool.query(
    `
      SELECT user_id, feature_name, is_enabled, reason
      FROM user_feature_access
      WHERE feature_name = $1
        AND user_id IN (0, $2)
    `,
    [featureName, userId ?? 0]
  )

  const rows = res.rows

  const globalRow = rows.find(r => r.user_id === 0) ?? null
  const userRow = rows.find(r => r.user_id === userId) ?? null

  // Global OFF, hard disable semua
  if (globalRow && globalRow.is_enabled === false) {
    return {
      enabled: false,
      scope: "global",
      reason: globalRow.reason ?? null
    }
  }

  // Global ON / belum di-set, cek user
  if (userRow) {
    if (userRow.is_enabled === false) {
      return {
        enabled: false,
        scope: "user",
        reason: userRow.reason ?? null
      }
    }

    return {
      enabled: true,
      scope: "ok",
      reason: null
    }
  }

  // Tidak ada row sama sekali, default ON
  return {
    enabled: true,
    scope: "ok",
    reason: null
  }
}

