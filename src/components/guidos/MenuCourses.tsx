import Image from 'next/image';
import { formatPrice, type Course } from './menu-data';

type Variant = 'card' | 'full' | 'reference';

/**
 * The menu set like a printed card: italic course names, dish names in the
 * serif, prices flush right with no leaders. "card" is the short version on
 * the landing page, "full" the menu page with every size, and "reference"
 * the compact price list beside the order form.
 */
export default function MenuCourses({
  courses,
  variant,
  headingLevel = 'h3',
}: {
  courses: Course[];
  variant: Variant;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  const showSizes = variant !== 'card';
  return (
    <div className={variant === 'full' ? 'gg-menu gg-menu--full' : variant === 'card' ? 'gg-menu' : undefined}>
      {courses.map((course) => (
        <div className="gg-course" key={course.id} id={variant === 'full' ? course.id : undefined}>
          <Heading className="gg-course-title">{course.title}</Heading>
          <ul>
            {course.dishes.map((d) => {
              const sized = showSizes && !d.soldOut && d.sizes.length > 0;
              const photo = variant === 'full' && d.image;
              return (
                <li key={d.key} className={`gg-dish${d.soldOut ? ' is-sold-out' : ''}${photo ? ' has-photo' : ''}`}>
                  {photo && (
                    <span className="gg-dish-thumb">
                      <Image
                        src={d.image as string}
                        alt=""
                        fill
                        sizes="96px"
                        style={{ objectFit: 'cover' }}
                        unoptimized={/^https?:/.test(d.image as string) && !/\.convex\.cloud\//.test(d.image as string)}
                      />
                    </span>
                  )}
                  <span className="gg-dish-name">{d.name}</span>
                  <span className="gg-dish-price">
                    {d.soldOut ? 'Sold out' : sized ? '' : formatPrice(d.price)}
                  </span>
                  {d.qualifier && <span className="gg-dish-note">{d.qualifier}</span>}
                  {d.limited && <span className="gg-dish-note gg-dish-note--limited">Limited edition</span>}
                  {sized && (
                    <dl className="gg-sizes">
                      {d.sizes.map((s) => (
                        <div key={s.label}>
                          <dt>{s.label}</dt>
                          <dd>{formatPrice(s.price)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
