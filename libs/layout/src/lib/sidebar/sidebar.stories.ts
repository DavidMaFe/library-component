import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { LcSidebar } from './sidebar';
import { LcSidebarItem } from './sidebar-item';

const icon = (path: string) =>
  `<svg lcSidebarIcon viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;

const meta: Meta<LcSidebar> = {
  title: 'Layout/Sidebar',
  component: LcSidebar,
  decorators: [moduleMetadata({ imports: [LcSidebar, LcSidebarItem] })],
  parameters: { layout: 'fullscreen' },
  args: { collapsed: false },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;min-height:100vh">
        <lc-sidebar label="Admin" [(collapsed)]="collapsed">
          <strong lcSidebarHeader>Acme Admin</strong>
          <a lc-sidebar-item href="#dashboard" active>${icon('M3 10l7-7 7 7v7H3z')}Dashboard</a>
          <a lc-sidebar-item href="#orders">${icon('M4 5h12M4 10h12M4 15h12')}Orders</a>
          <a lc-sidebar-item href="#customers">${icon('M10 10a3 3 0 100-6 3 3 0 000 6zM4 17a6 6 0 0112 0')}Customers</a>
          <h3>Settings</h3>
          <button lc-sidebar-item type="button">${icon('M10 3a7 7 0 100 14 7 7 0 000-14zM10 6v4l3 2')}Settings</button>
        </lc-sidebar>
        <main style="flex:1;padding:2rem"><h1 style="margin-top:0">Dashboard</h1><p>Collapse the sidebar with its button.</p></main>
      </div>`,
  }),
};
export default meta;

type Story = StoryObj<LcSidebar>;

export const Expanded: Story = {};
export const Collapsed: Story = { args: { collapsed: true } };
