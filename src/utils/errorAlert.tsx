// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Swal from 'sweetalert2/dist/sweetalert2.min.js';

export default function errorAlert(errorName: string, icon: string) {
  const title = icon.slice(0, 1).toUpperCase() + icon.slice(1);
  Swal.fire({
    title: title,
    text: errorName,
    icon: icon,
    confirmButtonColor: '#3085d6',
  });
}
