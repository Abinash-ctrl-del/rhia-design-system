import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { iconGroups } from './icon-set';
import { Effects, IconSet, SemanticColors, TextStyles } from './FoundationsDoc';

const meta = {
  title: 'Foundations/Styles',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// bg/primary → violet/7 (#6B2BFF); ai/spark → static/spark (#D4FF3F)
export const SemanticColours: Story = {
  render: () => <SemanticColors />,
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('bg/primary')).backgroundColor).toBe('rgb(107, 43, 255)');
    await expect(getComputedStyle(canvas.getByTestId('ai/spark')).backgroundColor).toBe('rgb(212, 255, 63)');
  },
};

export const TextStylesStory: Story = {
  name: 'Text styles',
  render: () => <TextStyles />,
  play: async ({ canvas }) => {
    const h = getComputedStyle(canvas.getByTestId('heading/md'));
    await expect(h.fontSize).toBe('20px');
    await expect(h.lineHeight).toBe('28px');
  },
};

export const EffectsStory: Story = {
  name: 'Effects',
  render: () => <Effects />,
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByTestId('shadow/sm')).boxShadow).not.toBe('none');
  },
};

export const Icons: StoryObj<{ size: number; strokeWidth: number }> = {
  args: { size: 24, strokeWidth: 1.5 },
  argTypes: { size: { control: { type: 'inline-radio' }, options: [16, 20, 24] }, strokeWidth: { control: { type: 'range', min: 1, max: 2, step: 0.25 } } },
  render: (args) => <IconSet size={args.size} strokeWidth={args.strokeWidth} />,
  play: async ({ canvas }) => {
    const total = Object.values(iconGroups).flat().length;
    await expect(canvas.queryAllByText('missing')).toHaveLength(0);
    await expect(canvas.getAllByTestId(/^icon-/)).toHaveLength(total);
  },
};
