import { updateFeatureFlag, getEffectiveFeatureFlag } from "../services/featureFlagService";
import { FeatureName, FlagScope, EffectiveFlag } from "../repositories/featureFlagRepository";
import { Request, Response } from "express";

// make handler for both functions
// Update feature flag controller
export async function updateFlagController(
    req: Request, 
    res: Response
) {
    try {
        const { userId, featureName, isEnabled, reason } = req.body as {
            userId: number | null
            featureName: FeatureName, // need type assertion or no (?)
            isEnabled: boolean,
            reason?: string

        }

        if (!featureName || typeof isEnabled !== "boolean") {
            return res.status(400).json({ message: "featureName, isEnabled harus diisi!"})
        }
        
        const result = await updateFeatureFlag({userId, featureName, isEnabled, reason});
        return res.status(200).json({message: "", result});

    } catch(err) {
        console.error("Error updating feature flag: ", err);
        return res.status(500).json({ message: "Internal server error"});
    }
}

// Get effective feature flag controller
export async function getFlagController(
    req: Request,
    res: Response
) {
    try {
        const {userId, featureName} = req.body as {
            userId: number | null
            featureName: FeatureName
        }
        if (!featureName) {
            throw res.status(400).json({ message: "featureName harus diisi"})
        } else {
            const result = await getEffectiveFeatureFlag({userId, featureName})
            return res.status(200).json(result)
        }
    } catch(err) {
        console.error("Error getting effective feature flag: ", err);
        return res.status(500).json({ message: "Internal server error"});
    }
}

export async function checkMyFlagController(req: Request, res: Response) {
    try {
        const user = (req as any).user;
        const { featureName } = req.body as { featureName: FeatureName };

        if (!featureName) {
            return res.status(400).json({ message: "Feature name required" });
        }

        const result = await getEffectiveFeatureFlag({
            userId: user ? user.user_id : null,
            featureName: featureName
        });

        res.json({ success: true, data: result });

    } catch (err) {
        console.error("Check Flag Error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

// CHECK FLAG FROM PHP
export async function internalCheckFlag(req: Request, res: Response) {
    try {
        const apiKey = req.headers['x-internal-secret'];
        if (apiKey !== process.env.INTERNAL_API_KEY) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const { userId, featureName } = req.body as { 
            userId: number | null, 
            featureName: FeatureName 
        };

        if (!featureName) {
            return res.status(400).json({ success: false, message: "Feature name required" });
        }

        const result = await getEffectiveFeatureFlag({
            userId: userId,
            featureName: featureName
        });

        res.json({ success: true, data: result });

    } catch (err) {
        console.error("Internal Flag Check Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}