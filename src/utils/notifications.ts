
import { Notify, Report } from 'notiflix';

// Initialize Notiflix with default configuration
Notify.init({
  position: 'right-top',
  distance: '10px',
  opacity: 1,
  borderRadius: '8px',
  timeout: 3000,
  showOnlyTheLastOne: false,
  clickToClose: true,
  cssAnimationStyle: 'from-right',
  fontFamily: 'inherit',
});

Report.init({
  svgSize: '50px',
  fontFamily: 'inherit',
  titleFontSize: '16px',
  messageFontSize: '14px',
  buttonFontSize: '15px',
  cssAnimationStyle: 'fade',
  plainText: true,
});

/**
 * Utility class for displaying notifications throughout the application
 */
export class Notifications {
  /**
   * Display a success notification
   * @param message - Message to display
   */
  static success(message: string): void {
    Notify.success(message);
  }

  /**
   * Display an error notification
   * @param message - Message to display
   */
  static error(message: string): void {
    Notify.failure(message);
  }

  /**
   * Display a warning notification
   * @param message - Message to display
   */
  static warning(message: string): void {
    Notify.warning(message);
  }

  /**
   * Display an info notification
   * @param message - Message to display
   */
  static info(message: string): void {
    Notify.info(message);
  }

  /**
   * Display a confirmation dialog
   * @param title - Title of the dialog
   * @param message - Message to display
   * @param onConfirm - Callback function when confirmed
   */
  static confirm(title: string, message: string, onConfirm: () => void): void {
    Report.confirm(
      title,
      message,
      'Confirm',
      onConfirm,
      () => {}, // onCancel - empty function
      {
        buttonColor: '#fff',
        buttonBackground: '#2563eb',
        cancelButtonColor: '#fff',
        cancelButtonBackground: '#6b7280',
      }
    );
  }
}
