/**
 * Unify GET /api/target-environment/public and authenticated GET shapes for the UI.
 * Older backends only returned presets, activeTargetId, and stageBaseUrl.
 */
export function normalizeTargetEnvironmentResponse(data) {
    if (!data || typeof data !== 'object') return null;
    const options =
        (Array.isArray(data.options) && data.options.length > 0 && data.options) ||
        (Array.isArray(data.presets) && data.presets.length > 0 && data.presets) ||
        [];
    if (options.length === 0) return null;
    const current =
        data.current && typeof data.current === 'object'
            ? data.current
            : {
                  id: data.activeTargetId ?? null,
                  baseUrl: data.stageBaseUrl || undefined,
              };
    return { ...data, options, current };
}
