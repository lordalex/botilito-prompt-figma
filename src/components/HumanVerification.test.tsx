import { render, screen, waitFor } from '@testing-library/react';
import { HumanVerification } from './HumanVerification';
import { AuthProvider } from '../providers/AuthProvider';
import { VoteTrackerProvider } from '../providers/VoteTrackerProvider';
import { vi } from 'vitest';
import { api as profileApi } from '@/services/api';
import { fetchVerificationSummary, getUserVerificationStats } from '../utils/humanVerification/api';

vi.mock('@/services/api');
vi.mock('../providers/AuthProvider', async () => {
  const actual = await vi.importActual('../providers/AuthProvider');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});
vi.mock('../utils/humanVerification/api');

describe('HumanVerification', () => {
  it('renders without crashing', async () => {
    const mockProfile = {
      data: {
        id: '123',
        xp: 100,
        badges: [],
      }
    };
    const mockSummary = {
      cases: [],
      pagination: { page: 1, pageSize: 10, returnedCount: 0, hasMore: false, totalItems: 0 },
      summary: { total: 0 }
    };
    const mockStats = {
      total_verifications: 5,
      points: 120,
    };

    const useAuth = await import('../providers/AuthProvider');
    vi.mocked(useAuth.useAuth).mockReturnValue({
        user: { id: '123' },
        session: { access_token: 'abc' },
        isLoading: false,
        profileComplete: true,
        profileChecked: true,
        checkUserProfile: vi.fn(),
        isPasswordRecovery: false,
        clearPasswordRecovery: vi.fn(),
        signOut: vi.fn(),
        isAuthenticated: true,
    });
    
    vi.mocked(profileApi.profile.get).mockResolvedValue(mockProfile);
    vi.mocked(fetchVerificationSummary).mockResolvedValue(mockSummary);
    vi.mocked(getUserVerificationStats).mockResolvedValue(mockStats);

    render(
      <AuthProvider>
        <VoteTrackerProvider>
          <HumanVerification />
        </VoteTrackerProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Casos Pendientes de Validación')).toBeInTheDocument();
    });
  });
});
