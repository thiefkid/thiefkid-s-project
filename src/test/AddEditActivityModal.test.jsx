import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddEditActivityModal from '../components/itinerary/AddEditActivityModal.jsx';

const noop = () => {};

function renderModal(props = {}) {
  return render(
    <AddEditActivityModal
      existing={null}
      dayDate="2026-07-10"
      onSave={props.onSave ?? noop}
      onClose={props.onClose ?? noop}
      {...props}
    />
  );
}

describe('AddEditActivityModal — layout & visibility', () => {
  it('renders Cancel and Add activity buttons', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add activity/i })).toBeInTheDocument();
  });

  it('shows "Save changes" when editing an existing activity', () => {
    renderModal({
      existing: { id: '1', name: 'Test', type: 'activity' },
    });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('action buttons are outside the scrollable area (pinned at bottom)', () => {
    renderModal();
    const saveBtn = screen.getByRole('button', { name: /add activity/i });
    // The buttons' parent should have border-t (the sticky footer separator)
    const actionsContainer = saveBtn.parentElement;
    expect(actionsContainer.className).toContain('border-t');
    expect(actionsContainer.className).toContain('flex-shrink-0');
  });

  it('modal container uses dvh units (not vh) for max-height', () => {
    renderModal();
    // The modal panel is the element with the rounded-t-2xl class
    const panel = document.querySelector('.rounded-t-2xl');
    expect(panel.className).toMatch(/max-h-\[85dvh\]/);
    expect(panel.className).not.toMatch(/max-h-\[90vh\]/);
  });

  it('modal container uses flex-col layout so buttons stay pinned', () => {
    renderModal();
    const panel = document.querySelector('.rounded-t-2xl');
    expect(panel.className).toContain('flex');
    expect(panel.className).toContain('flex-col');
  });

  it('scrollable form area has overflow-y-auto', () => {
    renderModal();
    // The scrollable div is inside the form, containing the inputs
    const nameInput = screen.getByPlaceholderText(/harbour bridge/i);
    const scrollableArea = nameInput.closest('.overflow-y-auto');
    expect(scrollableArea).not.toBeNull();
  });

  it('modal container has flex-col to keep buttons pinned below scrollable content', () => {
    renderModal();
    const panel = document.querySelector('.rounded-t-2xl');
    // flex + flex-col ensures the action buttons stay at the bottom
    expect(panel.className).toContain('flex');
    expect(panel.className).toContain('flex-col');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error when submitting with empty name', async () => {
    const user = userEvent.setup();
    renderModal();
    // Clear the name field and submit
    const nameInput = screen.getByPlaceholderText(/harbour bridge/i);
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /add activity/i }));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
