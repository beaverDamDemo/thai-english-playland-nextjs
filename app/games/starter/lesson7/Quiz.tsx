'use client';

export default function Quiz({
  onComplete,
  primaryColor,
}: {
  onComplete: (score: number, total: number) => void;
  primaryColor: string;
}) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2 style={{ color: primaryColor, marginTop: 0, fontSize: '2.5em', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Lesson coming soon</h2>
      <p>This lesson has no content yet. It will be added later.</p>
      <button
        onClick={() => onComplete(0, 0)}
        style={{ marginTop: '12px', padding: '8px 12px' }}
      >
        Close
      </button>
    </div>
  );
}
