import { create } from 'zustand';

interface Config {
	TIMEOUT_SECONDS: string;
	TIME_ROTATE_IMAGE_S: string;
	FAILED_MEDIA_COOLDOWN_S: string;
	CDS_RETRY_SECONDS: string;
	API_URL_CDS: string;
}

interface AppState {
	config: Config;
	isConfigLoaded: boolean;
	isConfigLoading: boolean;
	configError: string | null;
	setConfig: (c: Partial<Config>) => void;
	loadFromEnv: () => Promise<void>;
}

const defaultConfig = (): Config => ({
	TIMEOUT_SECONDS: '',
	TIME_ROTATE_IMAGE_S: '',
	FAILED_MEDIA_COOLDOWN_S: '',
	CDS_RETRY_SECONDS: '',
	API_URL_CDS: '',
});

const useAppStore = create<AppState>((set, get) => ({
	config: defaultConfig(),
	isConfigLoaded: false,
	isConfigLoading: false,
	configError: null,
	setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
	loadFromEnv: async () => {
		const { isConfigLoaded, isConfigLoading } = get();

		if (isConfigLoaded || isConfigLoading) {
			return;
		}

		set({ isConfigLoading: true, configError: null });

		try {
			const response = await fetch('/api/config', {
				cache: 'no-store',
				headers: {
					Accept: 'application/json',
				},
			});

			if (!response.ok) {
				const responseBody = await response.json().catch(() => null) as { error?: string } | null;
				throw new Error(responseBody?.error || `No se pudo cargar la configuración: ${response.status}`);
			}

			const remoteConfig = (await response.json()) as Config;

			set({
				config: remoteConfig,
				isConfigLoaded: true,
				isConfigLoading: false,
				configError: null,
			});
		} catch (error) {
			set({
				isConfigLoaded: true,
				isConfigLoading: false,
				configError: error instanceof Error
					? error.message
					: 'No se pudo cargar la configuración remota.',
			});
		}
	},
}));

export default useAppStore;

export { defaultConfig };