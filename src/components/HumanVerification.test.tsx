import { render, screen, waitFor } from '@testing-library/react';
import { HumanVerification } from './HumanVerification';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { vi } from 'vitest';
import { api as profileApi } from '@/services/api';
vi.mock('@/services/api');
import { fetchVerificationSummary, getUserVerificationStats } from '../utils/humanVerification/api';

vi.mock('../providers/AuthProvider');
vi.mock('../lib/apiService');
vi.mock('../utils/humanVerification/api');

describe('HumanVerification', () => {
  it('renders without crashing', async () => {
    const mockProfile = {
      id: '123',
      xp: 100,
      badges: [],
    };
    const mockSummary = {
      cases: [],
      pagination: { page: 1, pageSize: 10, returnedCount: 0, hasMore: false },
    };
    const mockStats = {
      total_verifications: 5,
      points: 120,
    };

    vi.mocked(useAuth).mockReturnValue({
        user: { id: '123' },
        session: { access_token: 'abc' },
        isLoading: false,
    });
    vi.mocked(profileApi.profile.get).mockResolvedValue(mockProfile);
    vi.mocked(fetchVerificationSummary).mockResolvedValue(mockSummary);
    vi.mocked(getUserVerificationStats).mockResolvedValue(mockStats);

    render(
        <HumanVerification />
    );

    await waitFor(() => {
      expect(screen.getByText('Tu Impacto como Verificador')).toBeInTheDocument();
    });
  });
});
