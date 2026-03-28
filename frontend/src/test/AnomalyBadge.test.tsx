import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AnomalyBadge from '../components/AnomalyBadge'

describe('AnomalyBadge', () => {
    it('renders the anomaly message correctly', () => {
        render(<AnomalyBadge anomaly="High systolic BP: 185 mmHg (limit: 180 mmHg)" />)
        expect(
            screen.getByText('High systolic BP: 185 mmHg (limit: 180 mmHg)')
        ).toBeInTheDocument()
    })

    it('renders the warning icon', () => {
        const { container } = render(
            <AnomalyBadge anomaly="Session too short: 90 min (minimum: 120 min)" />
        )
        expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
        const { container } = render(
            <AnomalyBadge anomaly="Excess weight gain: 4.0kg above dry weight (limit: 3kg)" />
        )
        const badge = container.firstChild as HTMLElement
        expect(badge.className).toContain('bg-red-50')
        expect(badge.className).toContain('text-red-600')
    })
})