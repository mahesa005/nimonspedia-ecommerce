import { _updateFeatureFlag, _getEffectiveFeatureFlag, FeatureName, EffectiveFlag } from "../repositories/featureFlagRepository";

export async function updateFeatureFlag(params: {
    userId: number | null
    featureName: FeatureName
    isEnabled: boolean
    reason?: string
}) {
    console.log("Parameter: ", params)
    return await _updateFeatureFlag(params)
}

export async function getEffectiveFeatureFlag(params : {
    userId: number | null
    featureName: FeatureName
}): Promise<EffectiveFlag> {
    console.log("Parameter: ", params)
    return await _getEffectiveFeatureFlag(params)
}