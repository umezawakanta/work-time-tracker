import React, { cloneElement, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
} from '../dropdown-menu';
import { Button } from '../button';

// Mock Radix UI to avoid complex dropdown testing
jest.mock('@radix-ui/react-dropdown-menu', () => {
  const React = require('react');
  const create = React.createElement;
  const { cloneElement } = React;
  return {
    Root: ({ children, onOpenChange, open }: any) =>
      create(
        'div',
        {
          'data-testid': 'dropdown-root',
          'data-open': open,
          onClick: () => onOpenChange && onOpenChange(!open),
        },
        children
      ),
    ItemIndicator: ({ children }: any) =>
      create('span', { 'data-testid': 'dropdown-item-indicator' }, children),
    Trigger: ({ children, asChild, ...props }: any) =>
      asChild
        ? cloneElement(children, { ...props, 'data-testid': 'dropdown-trigger' })
        : create('button', { ...props, 'data-testid': 'dropdown-trigger' }, children),
    Portal: ({ children }: any) => create('div', { 'data-testid': 'dropdown-portal' }, children),
    Content: ({ children, className, sideOffset, ...props }: any) =>
      create(
        'div',
        { 'data-testid': 'dropdown-content', className, 'data-side-offset': sideOffset, ...props },
        children
      ),
    Item: ({ children, className, ...props }: any) =>
      create('div', { 'data-testid': 'dropdown-item', className, ...props }, children),
    CheckboxItem: ({ children, checked, onCheckedChange, className, ...props }: any) =>
      create(
        'div',
        {
          'data-testid': 'dropdown-checkbox-item',
          className,
          'data-checked': checked,
          onClick: () => onCheckedChange && onCheckedChange(!checked),
          ...props,
        },
        children
      ),
    RadioGroup: ({ children, value, onValueChange, ...props }: any) =>
      create(
        'div',
        { 'data-testid': 'dropdown-radio-group', 'data-value': value, ...props },
        children && Array.isArray(children)
          ? children.map((child: any, index: number) =>
              cloneElement(child, {
                key: index,
                groupValue: value,
                onGroupValueChange: onValueChange,
              })
            )
          : children &&
              cloneElement(children, { groupValue: value, onGroupValueChange: onValueChange })
      ),
    RadioItem: ({ children, value, groupValue, onGroupValueChange, className, ...props }: any) =>
      create(
        'div',
        {
          'data-testid': 'dropdown-radio-item',
          className,
          'data-value': value,
          'data-checked': groupValue === value,
          onClick: () => onGroupValueChange && onGroupValueChange(value),
          ...props,
        },
        children
      ),
    Label: ({ children, className, ...props }: any) =>
      create('div', { 'data-testid': 'dropdown-label', className, ...props }, children),
    Separator: ({ className, ...props }: any) =>
      create('div', { 'data-testid': 'dropdown-separator', className, ...props }),
    Group: ({ children, ...props }: any) =>
      create('div', { 'data-testid': 'dropdown-group', ...props }, children),
    Sub: ({ children, open, onOpenChange }: any) =>
      create('div', { 'data-testid': 'dropdown-sub', 'data-open': open }, children),
    SubTrigger: ({ children, className, inset, ...props }: any) =>
      create(
        'div',
        { 'data-testid': 'dropdown-sub-trigger', className, 'data-inset': inset, ...props },
        children
      ),
    SubContent: ({ children, className, ...props }: any) =>
      create('div', { 'data-testid': 'dropdown-sub-content', className, ...props }, children),
  };
});

// Test components
const TestDropdownMenu: React.FC<{
  onItemClick?: () => void;
  onOpenChange?: (open: boolean) => void;
}> = ({ onItemClick = jest.fn(), onOpenChange = jest.fn() }) => (
  <DropdownMenu onOpenChange={onOpenChange}>
    <DropdownMenuTrigger asChild>
      <Button>Open Menu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onItemClick}>
        Profile
        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const TestCheckboxDropdown: React.FC = () => {
  const [checked, setChecked] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Toggle Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
          Show Toolbar
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TestRadioDropdown: React.FC = () => {
  const [value, setValue] = useState('light');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Theme Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TestSubMenuDropdown: React.FC = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Menu with Submenu</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>New File</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>More Tools</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Developer Tools</DropdownMenuItem>
          <DropdownMenuItem>Extensions</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
);

describe('DropdownMenu Components', () => {
  describe('DropdownMenu Root', () => {
    it('renders dropdown menu correctly', () => {
      render(<TestDropdownMenu />);

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
      expect(screen.getByText('Open Menu')).toBeInTheDocument();
    });

    it('handles open state changes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();

      render(<TestDropdownMenu onOpenChange={handleOpenChange} />);

      const root = screen.getByTestId('dropdown-root');
      await user.click(root);

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('DropdownMenuTrigger', () => {
    it('renders trigger as child component when asChild is true', () => {
      render(<TestDropdownMenu />);

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveTextContent('Open Menu');
    });

    it('renders trigger as button when asChild is false', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Direct Trigger</DropdownMenuTrigger>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveTextContent('Direct Trigger');
    });
  });

  describe('DropdownMenuContent', () => {
    it('renders content with correct styling', () => {
      render(<TestDropdownMenu />);

      const content = screen.getByTestId('dropdown-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass(
        'z-50',
        'min-w-[8rem]',
        'overflow-hidden',
        'rounded-md',
        'border',
        'bg-popover',
        'p-1',
        'text-popover-foreground',
        'shadow-md'
      );
    });

    it('applies custom className', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveClass('custom-content');
    });

    it('applies sideOffset correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const content = screen.getByTestId('dropdown-content');
      expect(content).toHaveAttribute('data-side-offset', '10');
    });
  });

  describe('DropdownMenuItem', () => {
    it('renders menu items correctly', () => {
      render(<TestDropdownMenu />);

      const items = screen.getAllByTestId('dropdown-item');
      expect(items).toHaveLength(3);
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('applies correct styling to menu items', () => {
      render(<TestDropdownMenu />);

      const profileItem = screen.getByText('Profile').closest('[data-testid="dropdown-item"]');
      expect(profileItem).toHaveClass(
        'relative',
        'flex',
        'cursor-default',
        'select-none',
        'items-center',
        'rounded-sm',
        'px-2',
        'py-1.5',
        'text-sm',
        'outline-none'
      );
    });

    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleItemClick = jest.fn();

      render(<TestDropdownMenu onItemClick={handleItemClick} />);

      const profileItem = screen.getByText('Profile').closest('[data-testid="dropdown-item"]');
      await user.click(profileItem!);

      expect(handleItemClick).toHaveBeenCalledTimes(1);
    });

    it('applies inset styling when specified', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByText('Inset Item').closest('[data-testid="dropdown-item"]');
      expect(item).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('renders checkbox items correctly', async () => {
      const user = userEvent.setup();
      render(<TestCheckboxDropdown />);

      const checkboxItem = screen.getByTestId('dropdown-checkbox-item');
      expect(checkboxItem).toBeInTheDocument();
      expect(checkboxItem).toHaveAttribute('data-checked', 'false');

      await user.click(checkboxItem);
      expect(checkboxItem).toHaveAttribute('data-checked', 'true');
    });

    it('applies correct styling to checkbox items', () => {
      render(<TestCheckboxDropdown />);

      const checkboxItem = screen.getByTestId('dropdown-checkbox-item');
      expect(checkboxItem).toHaveClass(
        'relative',
        'flex',
        'cursor-default',
        'select-none',
        'items-center',
        'rounded-sm',
        'py-1.5',
        'pl-8',
        'pr-2',
        'text-sm',
        'outline-none'
      );
    });
  });

  describe('DropdownMenuRadioGroup and RadioItem', () => {
    it('renders radio group correctly', () => {
      render(<TestRadioDropdown />);

      const radioGroup = screen.getByTestId('dropdown-radio-group');
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveAttribute('data-value', 'light');
    });

    it('renders radio items correctly', () => {
      render(<TestRadioDropdown />);

      const radioItems = screen.getAllByTestId('dropdown-radio-item');
      expect(radioItems).toHaveLength(3);

      const lightItem = screen.getByText('Light').closest('[data-testid="dropdown-radio-item"]');
      const darkItem = screen.getByText('Dark').closest('[data-testid="dropdown-radio-item"]');

      expect(lightItem).toHaveAttribute('data-checked', 'true');
      expect(darkItem).toHaveAttribute('data-checked', 'false');
    });

    it('handles radio item selection', async () => {
      const user = userEvent.setup();
      render(<TestRadioDropdown />);

      const darkItem = screen.getByText('Dark').closest('[data-testid="dropdown-radio-item"]');
      await user.click(darkItem!);

      const radioGroup = screen.getByTestId('dropdown-radio-group');
      expect(radioGroup).toHaveAttribute('data-value', 'dark');
    });

    it('applies correct styling to radio items', () => {
      render(<TestRadioDropdown />);

      const radioItem = screen.getAllByTestId('dropdown-radio-item')[0];
      expect(radioItem).toHaveClass(
        'relative',
        'flex',
        'cursor-default',
        'select-none',
        'items-center',
        'rounded-sm',
        'py-1.5',
        'pl-8',
        'pr-2',
        'text-sm',
        'outline-none'
      );
    });
  });

  describe('DropdownMenuLabel', () => {
    it('renders labels correctly', () => {
      render(<TestDropdownMenu />);

      const label = screen.getByTestId('dropdown-label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('My Account');
    });

    it('applies correct styling to labels', () => {
      render(<TestDropdownMenu />);

      const label = screen.getByTestId('dropdown-label');
      expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold');
    });

    it('applies inset styling when specified', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const label = screen.getByTestId('dropdown-label');
      expect(label).toHaveClass('pl-8');
    });
  });

  describe('DropdownMenuSeparator', () => {
    it('renders separators correctly', () => {
      render(<TestDropdownMenu />);

      const separators = screen.getAllByTestId('dropdown-separator');
      expect(separators).toHaveLength(2);
    });

    it('applies correct styling to separators', () => {
      render(<TestDropdownMenu />);

      const separator = screen.getAllByTestId('dropdown-separator')[0];
      expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
    });
  });

  describe('DropdownMenuShortcut', () => {
    it('renders shortcuts correctly', () => {
      render(<TestDropdownMenu />);

      const shortcut = screen.getByText('⇧⌘P');
      expect(shortcut).toBeInTheDocument();
    });

    it('applies correct styling to shortcuts', () => {
      render(<TestDropdownMenu />);

      const shortcut = screen.getByText('⇧⌘P');
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'opacity-60');
    });
  });

  describe('DropdownMenuGroup', () => {
    it('renders groups correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>Group Item 1</DropdownMenuItem>
              <DropdownMenuItem>Group Item 2</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const group = screen.getByTestId('dropdown-group');
      expect(group).toBeInTheDocument();
      expect(screen.getByText('Group Item 1')).toBeInTheDocument();
      expect(screen.getByText('Group Item 2')).toBeInTheDocument();
    });
  });

  describe('DropdownMenuSub and SubMenu', () => {
    it('renders submenu components correctly', () => {
      render(<TestSubMenuDropdown />);

      expect(screen.getByTestId('dropdown-sub')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-sub-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-sub-content')).toBeInTheDocument();
    });

    it('renders submenu trigger with correct styling', () => {
      render(<TestSubMenuDropdown />);

      const subTrigger = screen.getByTestId('dropdown-sub-trigger');
      expect(subTrigger).toHaveClass(
        'flex',
        'cursor-default',
        'select-none',
        'items-center',
        'rounded-sm',
        'px-2',
        'py-1.5',
        'text-sm',
        'outline-none'
      );
    });

    it('renders submenu content with correct styling', () => {
      render(<TestSubMenuDropdown />);

      const subContent = screen.getByTestId('dropdown-sub-content');
      expect(subContent).toHaveClass(
        'z-50',
        'min-w-[8rem]',
        'overflow-hidden',
        'rounded-md',
        'border',
        'bg-popover',
        'p-1',
        'text-popover-foreground',
        'shadow-lg'
      );
    });
  });

  describe('DropdownMenuPortal', () => {
    it('renders portal correctly', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <DropdownMenuItem>Portal Item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      );

      expect(screen.getAllByTestId('dropdown-portal')).toHaveLength(2); // One from DropdownMenuPortal, one from DropdownMenuContent
      expect(screen.getByText('Portal Item')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders complete dropdown menu structure', () => {
      render(<TestDropdownMenu />);

      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-label')).toBeInTheDocument();
      expect(screen.getAllByTestId('dropdown-separator')).toHaveLength(2);
      expect(screen.getAllByTestId('dropdown-item')).toHaveLength(3);
    });

    it('handles complex menu interactions', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();
      const handleItemClick = jest.fn();

      render(<TestDropdownMenu onOpenChange={handleOpenChange} onItemClick={handleItemClick} />);

      // Open menu
      const root = screen.getByTestId('dropdown-root');
      await user.click(root);
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      // Click item
      const profileItem = screen.getByText('Profile').closest('[data-testid="dropdown-item"]');
      await user.click(profileItem!);
      expect(handleItemClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('provides proper structure for screen readers', () => {
      render(<TestDropdownMenu />);

      // Menu structure should be accessible
      expect(screen.getByTestId('dropdown-root')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<TestDropdownMenu />);

      const trigger = screen.getByTestId('dropdown-trigger');
      trigger.focus();
      expect(trigger).toHaveFocus();

      // Test keyboard interactions
      await user.keyboard('{Enter}');
      // Menu opening behavior would be handled by Radix
    });

    it('supports ARIA attributes', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Open menu">Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('dropdown-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Open menu');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty menu gracefully', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Empty Menu</DropdownMenuTrigger>
          <DropdownMenuContent>{/* No items */}</DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });

    it('handles disabled items', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByText('Disabled Item').closest('[data-testid="dropdown-item"]');
      expect(item).toHaveAttribute('disabled');
    });

    it('handles rapid interactions', async () => {
      const user = userEvent.setup();
      const handleOpenChange = jest.fn();

      render(<TestDropdownMenu onOpenChange={handleOpenChange} />);

      const root = screen.getByTestId('dropdown-root');

      // Rapid clicking
      await user.click(root);
      await user.click(root);
      await user.click(root);

      expect(handleOpenChange).toHaveBeenCalledTimes(3);
    });
  });
});
