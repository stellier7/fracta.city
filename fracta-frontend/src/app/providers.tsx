'use client';

import React from 'react';
import { WagmiProvider, http } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Custom dark theme for RainbowKit
import '@rainbow-me/rainbowkit/styles.css';

// Override RainbowKit CSS variables for dark theme
const darkTheme = {
  accentColor: '#0066CC',
  accentColorForeground: '#ffffff',
  actionButtonBorder: 'rgba(255, 255, 255, 0.2)',
  actionButtonBorderMobile: 'rgba(255, 255, 255, 0.2)',
  actionButtonSecondaryBackground: 'rgba(0, 0, 0, 0.3)',
  closeButton: 'rgba(255, 255, 255, 0.8)',
  closeButtonBackground: 'rgba(0, 0, 0, 0.1)',
  connectButtonBackground: 'rgba(0, 0, 0, 0.2)',
  connectButtonBackgroundError: 'rgba(255, 73, 74, 0.2)',
  connectButtonInnerBackground: 'rgba(0, 0, 0, 0.1)',
  connectButtonText: '#ffffff',
  connectButtonTextError: '#ffffff',
  connectionIndicator: '#30E000',
  error: '#FF494A',
  generalBorder: 'rgba(255, 255, 255, 0.1)',
  generalBorderDim: 'rgba(255, 255, 255, 0.05)',
  menuItemBackground: 'rgba(0, 0, 0, 0.3)',
  modalBackground: 'rgba(0, 0, 0, 0.9)',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',
  modalBorder: 'rgba(255, 255, 255, 0.1)',
  modalText: '#ffffff',
  modalTextSecondary: 'rgba(255, 255, 255, 0.7)',
  profileAction: '#0066CC',
  profileActionHover: 'rgba(0, 102, 204, 0.8)',
  profileForeground: 'rgba(0, 0, 0, 0.3)',
  selectedOptionBorder: 'rgba(255, 255, 255, 0.2)',
  standby: '#FFD641',
  downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), rgba(0, 0, 0, 0.9)',
  downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), rgba(0, 0, 0, 0.9)',
  modalTextDim: 'rgba(255, 255, 255, 0.3)',
};

const config = getDefaultConfig({
  appName: 'Fracta.city',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            colors: darkTheme,
            fonts: {
              body: 'SFRounded, ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            },
            radii: {
              actionButton: '9999px',
              connectButton: '12px',
              menuButton: '12px',
              modal: '24px',
              modalMobile: '28px',
            },
            shadows: {
              connectButton: '0px 4px 12px rgba(0, 0, 0, 0.3)',
              dialog: '0px 8px 32px rgba(0, 0, 0, 0.6)',
              profileDetailsAction: '0px 2px 6px rgba(0, 0, 0, 0.3)',
              selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.4)',
              selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.3)',
              walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.4)',
            },
            blurs: {
              modalOverlay: 'blur(0px)',
            },
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 