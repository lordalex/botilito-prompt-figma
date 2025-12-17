import { render, screen } from '@testing-library/react';
import { HumanVerificationDetail } from './HumanVerificationDetail';
import { CaseEnriched } from '../utils/humanVerification/types';

describe('HumanVerificationDetail', () => {
  it('renders without crashing', () => {
    const mockCaseData: CaseEnriched = {
      id: '123',
      title: 'Test Case',
      status: 'open',
      summary: 'This is a test case',
      created_at: new Date().toISOString(),
      submission_type: 'Text',
      diagnostic_labels: ['falso'],
      human_votes: {
        count: 1,
        statistics: [{ label: 'falso', count: 1, percentage: 100 }],
        entries: [
          {
            vote: 'falso',
            reason: 'This is fake',
            date: new Date().toISOString(),
            user: {
              id: 'user1',
              full_name: 'Test User',
              reputation: 10,
            },
          },
        ],
      },
      metadata: {},
    };

    render(
      <HumanVerificationDetail
        caseData={mockCaseData}
        onBackToList={() => {}}
        onSubmit={() => {}}
      />
    );
    expect(screen.getByText('Test Case')).toBeInTheDocument();
    expect(screen.getByText('This is a test case')).toBeInTheDocument();
    expect(screen.getByText('Votación de la Comunidad')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
