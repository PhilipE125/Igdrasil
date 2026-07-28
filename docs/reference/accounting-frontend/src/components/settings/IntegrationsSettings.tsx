/**
 * Integrations settings — re-exports the integrations section from SettingsView.
 * The full integration logic (Fortnox OAuth, Visma, etc.) remains in SettingsView
 * and is rendered here via the existing component.
 */
import SettingsView from "@/components/views/SettingsView";

export function IntegrationsSettings() {
  return <SettingsView />;
}
