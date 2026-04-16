export function buildMailtoLink(email: string, subject = '', body = ''): string {
  const params = new URLSearchParams();
  params.set('to', email);

  if (subject) {
    params.set('su', subject);
  }

  if (body) {
    params.set('body', body);
  }

  return `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Sin nombre';
}

export function getCareerCode(careerName: string): string {
  return careerName.split(' - ')[0] ?? careerName;
}
