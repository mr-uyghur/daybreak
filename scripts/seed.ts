/**
 * Seed script — populates the DB with ~10 realistic positive news stories
 * so the feed is never empty before the first cron run.
 *
 * Run: pnpm seed
 */
import 'dotenv/config'
import crypto from 'crypto'
import { db } from '../db'
import { stories, reactions } from '../db/schema'
import { computeScore } from '../lib/scoring'
import { REACTIONS } from '../lib/brand'
import { eq } from 'drizzle-orm'

const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000)

function urlHash(url: string) {
  return crypto.createHash('sha256').update(url).digest('hex')
}

const SEED_STORIES = [
  {
    sourceUrl: 'https://www.goodnewsnetwork.org/coral-reef-restoration-record',
    headline: 'Scientists Restore 70,000 Coral Fragments to Great Barrier Reef in Record-Breaking Mission',
    summary:
      'A team of marine biologists has successfully transplanted more than 70,000 lab-grown coral fragments across 12 hectares of the Great Barrier Reef — the largest active restoration effort ever attempted. Early monitoring shows a 94% survival rate, giving researchers renewed optimism about reef resilience.',
    category: 'Environment',
    imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800',
    positivityScore: 0.95,
    publishedAt: hoursAgo(6),
  },
  {
    sourceUrl: 'https://www.positivenews.org.uk/new-malaria-vaccine-results',
    headline: 'New Malaria Vaccine Shows 77% Efficacy in Phase 3 Trial Across Four African Nations',
    summary:
      "Oxford University's R21 vaccine has shown 77% efficacy over two years in a Phase 3 trial conducted across Burkina Faso, Kenya, Mali, and Tanzania — crossing the WHO's 75% target for the first time. Researchers expect regulatory approval within 18 months, which could protect 40 million children annually.",
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    positivityScore: 0.97,
    publishedAt: hoursAgo(14),
  },
  {
    sourceUrl: 'https://www.bbc.com/news/science-tiger-population-india',
    headline: "India's Wild Tiger Population Doubles in 12 Years, Reaching 3,682 Animals",
    summary:
      "India's latest tiger census confirms the wild population has doubled since 2010, with 3,682 individuals now roaming the country's protected reserves. The turnaround is credited to community-led anti-poaching patrols, habitat corridors connecting reserves, and government funding that tripled over the period.",
    category: 'Animals',
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800',
    positivityScore: 0.94,
    publishedAt: hoursAgo(22),
  },
  {
    sourceUrl: 'https://reasonstobecheerful.world/universal-free-lunch-programme',
    headline: 'Finland Expands Universal Free School Lunch Programme to All Ages, Eliminating Food Insecurity in Schools',
    summary:
      'Finland has extended its universal free hot lunch programme — already covering K–12 — to all university students nationwide. The move, funded through a modest income-tax adjustment, means every Finnish student from age 6 through university graduation will eat a nutritious meal every school day at no cost.',
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    positivityScore: 0.91,
    publishedAt: hoursAgo(36),
  },
  {
    sourceUrl: 'https://www.goodnewsnetwork.org/ai-detects-pancreatic-cancer-early',
    headline: 'AI Model Detects Pancreatic Cancer with 92% Accuracy — Two Years Before Symptoms Appear',
    summary:
      "Researchers at Johns Hopkins have trained a machine-learning model on routine blood-test data that can flag pancreatic cancer up to 24 months before clinical symptoms develop. In a validation study of 10,000 patients, the model achieved 92% sensitivity at 99% specificity — potentially transforming outcomes for one of cancer's deadliest forms.",
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    positivityScore: 0.96,
    publishedAt: hoursAgo(30),
  },
  {
    sourceUrl: 'https://www.positivenews.org.uk/community-land-trust-affordable-homes',
    headline: 'Community Land Trust Delivers 2,000 Permanently Affordable Homes Across Rural England',
    summary:
      'A network of community land trusts has completed its goal of building 2,000 permanently affordable homes in rural English villages that had almost no affordable housing stock. Because the land is held in trust, the homes can never be sold at market rate, locking in affordability for future generations regardless of property price movements.',
    category: 'Community',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    positivityScore: 0.90,
    publishedAt: hoursAgo(48),
  },
  {
    sourceUrl: 'https://www.scientificamerican.com/perovskite-solar-efficiency-record',
    headline: 'Perovskite-Silicon Tandem Solar Cells Break 34% Efficiency Record in Independent Testing',
    summary:
      'A team at EPFL in Lausanne has achieved 34.2% conversion efficiency with a perovskite-silicon tandem cell — independently certified by NREL — shattering the previous record of 33.9%. Analysts estimate the technology could reach commercial viability within three years, potentially cutting solar electricity costs by 40%.',
    category: 'Science',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    positivityScore: 0.93,
    publishedAt: hoursAgo(18),
  },
  {
    sourceUrl: 'https://www.theguardian.com/world/golden-age-music-school-seniors',
    headline: 'This Free Music School for Adults Over 60 Has Launched 300 First-Time Musicians in Three Years',
    summary:
      "A community music school in Manchester that offers free instrument lessons to adults aged 60 and over has graduated 300 students — all of whom had never played an instrument before joining. Research conducted by the University of Manchester found participants showed significant reductions in loneliness and cognitive decline over the programme's three years.",
    category: 'Arts',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    positivityScore: 0.88,
    publishedAt: hoursAgo(60),
  },
  {
    sourceUrl: 'https://www.outsideonline.com/paralympic-record-altitude',
    headline: 'Blind Climber Sets New Record for Fastest Ascent of Denali, Reaching Summit in 10 Days',
    summary:
      'Erik Leidecker, who lost his sight at 32 following an accident, has set a new speed record for blind climbers on Denali — reaching the 6,190-metre summit in just 10 days with a two-person sighted guide team. Leidecker said he trained for four years, relying on tactile ice-reading techniques developed with his guides.',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    positivityScore: 0.89,
    publishedAt: hoursAgo(72),
  },
  {
    sourceUrl: 'https://www.reuters.com/world/indigenous-land-rights-brazil-victory',
    headline: 'Brazilian Supreme Court Rules to Expand Indigenous Land Recognition to 14 Additional Territories',
    summary:
      "In a unanimous ruling, Brazil's Supreme Court has mandated federal recognition of 14 additional indigenous territories covering 1.2 million hectares of Amazonian land. Legal experts call it the most significant expansion of indigenous land rights in 25 years, protecting both communities and critical forest carbon sinks.",
    category: 'World',
    imageUrl: 'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=800',
    positivityScore: 0.92,
    publishedAt: hoursAgo(44),
  },
]

async function main() {
  console.log('🌱 Seeding Daybreak database...\n')

  let inserted = 0
  let skipped = 0

  for (const story of SEED_STORIES) {
    const hash = urlHash(story.sourceUrl)
    const score = computeScore(story.positivityScore, story.publishedAt)

    try {
      const [row] = await db
        .insert(stories)
        .values({
          urlHash: hash,
          sourceUrl: story.sourceUrl,
          headline: story.headline,
          summary: story.summary,
          category: story.category,
          imageUrl: story.imageUrl,
          positivityScore: story.positivityScore,
          score,
          publishedAt: story.publishedAt,
          status: 'active',
        })
        .onConflictDoNothing({ target: stories.urlHash })
        .returning({ id: stories.id })

      if (row) {
        // Seed some realistic reaction counts
        const storyId = row.id
        for (const reaction of REACTIONS) {
          const seedCount = Math.floor(Math.random() * 40) + 1
          await db
            .insert(reactions)
            .values({ storyId, reactionType: reaction.type, count: seedCount })
            .onConflictDoNothing()
        }
        console.log(`  ✓ [${story.category.padEnd(12)}] ${story.headline.slice(0, 60)}…`)
        inserted++
      } else {
        console.log(`  — (already exists) ${story.headline.slice(0, 60)}…`)
        skipped++
      }
    } catch (err) {
      console.error(`  ✗ Failed: ${story.headline.slice(0, 60)}`, err)
    }
  }

  console.log(`\n✅ Done — ${inserted} inserted, ${skipped} skipped.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
