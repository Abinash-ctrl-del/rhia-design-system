import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { ColorPrimitives, RadiusPrimitives, SpacingPrimitives, TypographyPrimitives } from './PrimitivesDoc';

const meta = {
  title: 'Foundations/Primitives',
  component: ColorPrimitives,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ColorPrimitives>;

export default meta;
type Story = StoryObj<typeof meta>;

// Proves primitives.css is loaded: violet/7 (brand) is #6B2BFF; the lime spark #D4FF3F is lime/5 in Light (lime/9 in Dark).
export const Colors: Story = {
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('color/violet/7')).backgroundColor).toBe('rgb(107, 43, 255)');
    await expect(getComputedStyle(canvas.getByTestId('color/lime/5')).backgroundColor).toBe('rgb(212, 255, 63)');
  },
};

export const Spacing: Story = { render: () => <SpacingPrimitives /> };

export const Radius: Story = { render: () => <RadiusPrimitives /> };

// Proves the heading font token resolves to Geist.
export const Typography: Story = {
  render: () => <TypographyPrimitives />,
  play: async ({ canvas }) => {
    const h = canvas.getByTestId('type-24');
    await expect(getComputedStyle(h).fontFamily).toContain('Geist');
  },
};
