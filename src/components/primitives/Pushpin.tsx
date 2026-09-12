import { cx } from '../../lib/utils';

const COLORS = ['#E4574C', '#3D8DDE', '#3DBE7A', '#E8B93D'];

export default function Pushpin({ className, seed = 0 }: { className?: string; seed?: number }) {
  const color = COLORS[seed % COLORS.length];
  return (
    <span
      aria-hidden
      className={cx('absolute z-10 h-4 w-4 rounded-full border border-black/30 shadow-md', className)}
      style={{
        background: `radial-gradient(circle at 35% 30%, #fff8, transparent 40%), ${color}`,
      }}
    />
  );
}
