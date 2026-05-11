import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./page-modules/**/*.{js,ts,jsx,tsx,mdx}",
        "./shared/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // 🟢 PRIMARY SCALE (Brand) - Betafits Design Authority v1.1
                primary: {
                    50: '#F4F8EC',
                    100: '#E6F0D7',
                    200: '#CFE1AE',
                    300: '#B8D285',
                    400: '#A5C66C',
                    500: '#94BA5A',
                    600: '#7EA246',
                    700: '#688733',
                    800: '#526B25',
                    900: '#3B4D19',
                },
                // ⚪ TRUE NEUTRAL SCALE (No blue tint)
                neutral: {
                    50: '#FAFAFA',
                    100: '#F4F4F5',
                    200: '#E4E4E7',
                    300: '#D4D4D8',
                    400: '#A1A1AA',
                    500: '#71717A',
                    600: '#52525B',
                    700: '#3F3F46',
                    800: '#27272A',
                    900: '#18181B',
                    950: '#111111',
                },
                // SEMANTIC COLORS
                success: {
                    500: '#22C55E',
                    bg: '#DCFCE7',
                },
                error: {
                    500: '#EF4444',
                    bg: '#FEE2E2',
                },
                warning: {
                    500: '#F59E0B',
                    bg: '#FEF3C7',
                },
                info: {
                    500: '#3B82F6',
                    bg: '#DBEAFE',
                },
                // Legacy brand alias (backward compatibility during migration)
                brand: {
                    50: '#F4F8EC',
                    100: '#E6F0D7',
                    200: '#CFE1AE',
                    300: '#B8D285',
                    400: '#A5C66C',
                    500: '#94BA5A',
                    600: '#7EA246',
                    700: '#688733',
                    800: '#526B25',
                    900: '#3B4D19',
                    950: '#3B4D19',
                },
            },
            // TYPOGRAPHY SCALE
            fontSize: {
                'h1': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
                'h2': ['22px', { lineHeight: '1.35', fontWeight: '600' }],
                'h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
                'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
                'small': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
                'label': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
            },
            // SPACING SYSTEM (8px base unit) - Keep defaults, add semantic names
            spacing: {
                // Keep all default Tailwind spacing
                // Add semantic spacing for 8px grid
                '0': '0px',
                '0.5': '2px',
                '1': '4px',
                '1.5': '6px',
                '2': '8px',
                '2.5': '10px',
                '3': '12px',
                '3.5': '14px',
                '4': '16px',
                '5': '20px',
                '6': '24px',
                '7': '28px',
                '8': '32px',
                '9': '36px',
                '10': '40px',
                '11': '44px',
                '12': '48px',
                '14': '56px',
                '16': '64px',
                '20': '80px',
                '24': '96px',
                '28': '112px',
                '32': '128px',
                '36': '144px',
                '40': '160px',
                '44': '176px',
                '48': '192px',
                '52': '208px',
                '56': '224px',
                '60': '240px',
                '64': '256px',
                '72': '288px',
                '80': '320px',
                '96': '384px',
            },
            // BORDER RADIUS
            borderRadius: {
                'small': '6px',
                'medium': '10px',
                'large': '14px',
                'full': '9999px',
            },
            // SHADOW SYSTEM
            boxShadow: {
                'card': '0 1px 2px rgba(0, 0, 0, 0.05)',
                'elevated': '0 4px 6px rgba(0, 0, 0, 0.08)',
                'modal': '0 10px 25px rgba(0, 0, 0, 0.15)',
            },
        },
    },
    plugins: [],
};
export default config;
