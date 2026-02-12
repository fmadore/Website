#!/usr/bin/env python3
"""
Publication Text Analysis Script

Extracts and lemmatizes text from markdown/text files,
writes TypeScript data files directly for word cloud visualizations.

Folder structure:
    scripts/texts/en/  - English publications (.md or .txt) [gitignored]
    scripts/texts/fr/  - French publications (.md or .txt) [gitignored]

Output structure:
    src/lib/data/analysis/
    ├── publications/           - Individual publication files (lazy-loaded)
    │   ├── {publication-id}.ts
    │   └── index.ts           - Auto-generated index
    ├── corpus.ts              - Aggregated corpus data
    └── index.ts               - Main exports

Setup:
    cd scripts
    python -m venv venv
    venv\\Scripts\\activate  (Windows) or source venv/bin/activate (Unix)
    pip install spacy
    python -m spacy download en_core_web_lg
    python -m spacy download fr_core_news_lg

Usage:
    # Process a single file and write to data files
    python scripts/analyze-publications.py --file scripts/texts/fr/article.md --id article-id

    # Process all files in a language folder
    python scripts/analyze-publications.py --batch fr

    # Process both languages
    python scripts/analyze-publications.py --batch en
    python scripts/analyze-publications.py --batch fr
"""

import argparse
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Optional

# NLP libraries - install with: pip install spacy
try:
    import spacy
except ImportError:
    print("Please install spacy: pip install spacy")
    print("Then download models: python -m spacy download en_core_web_sm")
    print("                      python -m spacy download fr_core_news_sm")
    exit(1)



# Configuration
TOP_N_WORDS = 200  # Number of top words to keep per publication
MIN_WORD_LENGTH = 3  # Minimum word length to include
MIN_WORD_FREQ = 2  # Minimum frequency to include

# Common English stopwords (for filtering from French texts)
ENGLISH_STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their',
    'we', 'our', 'you', 'your', 'he', 'she', 'his', 'her', 'i', 'my',
    'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very',
    'just', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
    'same', 'both', 'any', 'now', 'also', 'new', 'one', 'two',
}

# Common French stopwords (for filtering from English texts)
FRENCH_STOPWORDS = {
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou',
    'mais', 'dans', 'sur', 'à', 'au', 'aux', 'pour', 'par', 'avec',
    'sans', 'sous', 'entre', 'vers', 'chez', 'ce', 'cette', 'ces',
    'son', 'sa', 'ses', 'leur', 'leurs', 'notre', 'nos', 'votre', 'vos',
    'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'il', 'elle', 'ils', 'elles',
    'je', 'tu', 'nous', 'vous', 'on', 'qui', 'que', 'quoi', 'dont',
    'où', 'si', 'ne', 'pas', 'plus', 'moins', 'très', 'bien', 'aussi',
    'comme', 'tout', 'tous', 'toute', 'toutes', 'autre', 'autres',
    'même', 'être', 'avoir', 'faire', 'pouvoir', 'vouloir', 'devoir',
    'donc', 'car', 'ainsi', 'alors', 'encore', 'déjà', 'jamais',
}

# Custom stopwords to add (domain-specific words to exclude)
CUSTOM_STOPWORDS_EN = {
    'et', 'al', 'ibid', 'pp', 'ed', 'eds', 'vol', 'no', 'cf',
    'http', 'https', 'www', 'org', 'com', 'pdf', 'doi', 'url',
    'amp',  # HTML entity
    # Author names and bibliographic artifacts
    'karthala', 'author', 'madore', 'paris', 'perez', 'loc', 'gomez', 'cit',
    'muriel', 'otayek', 'harmattan', 'frédérick', 'frederick',
    # Split place names (meaningless as individual words)
    'porto', 'novo', 'burkina', 'faso',
    # Months (from references/dates)
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
} | FRENCH_STOPWORDS  # Also filter French stopwords from English texts

CUSTOM_STOPWORDS_FR = {
    'les', 'des', 'dans', 'pour', 'par', 'sur', 'avec', 'cette',
    'être', 'avoir', 'faire', 'plus', 'aussi', 'tout', 'tous',
    'bien', 'très', 'peu', 'donc', 'ainsi', 'entre', 'sans',
    'http', 'https', 'www', 'org', 'com', 'pdf', 'doi', 'url',
    'amp',  # HTML entity
    # Author names and bibliographic artifacts
    'karthala', 'author', 'madore', 'paris', 'perez', 'loc', 'gomez', 'cit',
    'muriel', 'otayek', 'harmattan', 'frédérick', 'frederick',
    # Split place names (meaningless as individual words)
    'porto', 'novo', 'burkina', 'faso',
    # Months (from references/dates)
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
} | ENGLISH_STOPWORDS  # Also filter English stopwords from French texts


def load_spacy_model(language: str, model_size: str = 'lg'):
    """
    Load the appropriate spaCy model for the language.

    Args:
        language: 'en' or 'fr'
        model_size: 'sm' (small), 'md' (medium), 'lg' (large), or 'trf' (transformer)
                   Large (lg) is recommended for best accuracy with reasonable speed.
                   Transformer (trf) is most accurate but slower and requires more RAM.
    """
    # Model mapping by language and size
    models = {
        'en': {
            'sm': 'en_core_web_sm',
            'md': 'en_core_web_md',
            'lg': 'en_core_web_lg',
            'trf': 'en_core_web_trf',
        },
        'fr': {
            'sm': 'fr_core_news_sm',
            'md': 'fr_core_news_md',
            'lg': 'fr_core_news_lg',
            'trf': 'fr_dep_news_trf',
        }
    }

    model_name = models.get(language, {}).get(model_size, 'en_core_web_lg')

    try:
        nlp = spacy.load(model_name)
        print(f"Loaded spaCy model: {model_name}")
        return nlp
    except OSError:
        print(f"Model {model_name} not found. Downloading...")
        spacy.cli.download(model_name)
        return spacy.load(model_name)


def extract_text_from_file(file_path: Path) -> str:
    """Extract text from a markdown or text file."""
    text = file_path.read_text(encoding='utf-8')

    # Strip markdown formatting for cleaner analysis
    if file_path.suffix.lower() == '.md':
        # Remove markdown links [text](url) -> text
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        # Remove markdown images ![alt](url)
        text = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', text)
        # Remove headers markers
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        # Remove bold/italic markers
        text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text)
        text = re.sub(r'_{1,2}([^_]+)_{1,2}', r'\1', text)
        # Remove code blocks
        text = re.sub(r'```[\s\S]*?```', '', text)
        text = re.sub(r'`[^`]+`', '', text)

    return text


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    # Remove page numbers and headers (common patterns)
    text = re.sub(r'\n\d+\n', '\n', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def analyze_text(
    text: str,
    language: str,
    nlp,
    custom_stopwords: set
) -> dict:
    """
    Analyze text and extract word frequencies with lemmatization.

    Returns a dictionary with word frequencies and metadata.
    """
    # Clean the text
    text = clean_text(text)

    # Process with spaCy (process in chunks for large texts)
    max_length = 1000000
    if len(text) > max_length:
        text = text[:max_length]

    doc = nlp(text)

    # Extract lemmas with POS filtering
    word_data = []
    for token in doc:
        # Skip stopwords, punctuation, spaces, numbers
        if (token.is_stop or token.is_punct or token.is_space or
            token.like_num or token.is_digit):
            continue

        # Skip short words
        if len(token.lemma_) < MIN_WORD_LENGTH:
            continue

        # Skip custom stopwords
        lemma_lower = token.lemma_.lower()
        if lemma_lower in custom_stopwords:
            continue

        # Skip if not alphabetic
        if not token.is_alpha:
            continue

        # Map POS tags to our simplified categories
        pos_map = {
            'NOUN': 'noun',
            'VERB': 'verb',
            'ADJ': 'adj',
            'ADV': 'adv',
            'PROPN': 'propn',
        }
        pos = pos_map.get(token.pos_, 'other')

        word_data.append({
            'lemma': lemma_lower,
            'pos': pos,
        })

    # Count frequencies
    lemma_counts = Counter(w['lemma'] for w in word_data)

    # Get POS for each lemma (most common POS)
    lemma_pos = {}
    for w in word_data:
        lemma = w['lemma']
        if lemma not in lemma_pos:
            lemma_pos[lemma] = Counter()
        lemma_pos[lemma][w['pos']] += 1

    # Build frequency list
    frequencies = []
    for lemma, count in lemma_counts.most_common(TOP_N_WORDS):
        if count < MIN_WORD_FREQ:
            continue

        pos = lemma_pos[lemma].most_common(1)[0][0]

        frequencies.append({
            'word': lemma,
            'count': count,
            'lemma': lemma,
            'pos': pos,
        })

    # Calculate basic stats
    total_words = len(word_data)
    unique_words = len(lemma_counts)

    return {
        'wordCount': total_words,
        'uniqueWords': unique_words,
        'frequencies': frequencies,
    }


def extract_bigrams(text: str, nlp, language: str, top_n: int = 50) -> list:
    """Extract frequent bigrams (two-word phrases) with better filtering."""
    doc = nlp(clean_text(text))

    # Get custom stopwords for this language
    custom_stopwords = CUSTOM_STOPWORDS_EN if language == 'en' else CUSTOM_STOPWORDS_FR

    # Common reference/citation bigrams to exclude
    reference_bigrams = {
        # English reference patterns
        'university press', 'journal of', 'press university', 'oxford university',
        'cambridge university', 'new york', 'routledge london', 'brill leiden',
        'palgrave macmillan', 'ed eds', 'vol no', 'pp ed', 'ibid op',
        # French reference patterns
        'presses universitaires', 'université de', 'éditions de', 'revue de',
        'paris éditions', 'presses de', 'cahiers de',
        # Common meaningless patterns
        'in the', 'of the', 'and the', 'to the', 'on the', 'at the', 'for the',
        'de la', 'de le', 'de les', 'à la', 'à le', 'dans le', 'dans la',
        'sur le', 'sur la', 'pour le', 'pour la', 'par le', 'par la',
        'en le', 'en la', 'au le', 'du le', 'les de', 'des de',
        # Author names to exclude (website owner and common co-authors/cited authors)
        'frédérick madore', 'frederick madore', 'madore frédérick', 'madore frederick',
        'frédéric madore', 'madore frédéric',
        'muriel gomez', 'gomez muriel', 'marie nathalie', 'nathalie leblanc',
        'issouf binaté', 'binaté issouf', 'audet gosselin', 'gosselin audet',
        'yssoufou traoré', 'traoré yssoufou', 'louis audet', 'leblanc marie',
        'abdoulaye sounaye', 'sounaye abdoulaye', 'rené otayek', 'otayek rené',
        'issa cissé', 'cissé issa', 'louis triaud', 'triaud louis',
        'mamadou bodian', 'bodian mamadou', 'marie miran', 'miran marie',
        'université laval', 'laval université',
        # Generic/non-analytical bigrams
        'islamic africa', 'africa islamic',
        # Newspaper/journal names (reference artifacts)
        'islam info', 'info islam', 'nouvelle marche', 'marche nouvelle',
        'fraternité matin', 'matin fraternité', 'nasr vendredi', 'vendredi nasr',
        'observateur paalga', 'paalga observateur',
        'carrefour africain', 'africain carrefour',
        'togo presse', 'presse togo',
        'ivoire dimanche', 'dimanche ivoire',
        'bulletin francopaix', 'francopaix bulletin',
        'jeune afrique', 'afrique jeune',
        'canadian journal', 'journal canadian',
        'revue canadien', 'canadien revue',
        'croix africa', 'africa croix',
        # Publisher/university references
        'indiana university', 'university indiana',
        'modern african', 'african modern',
        'write press', 'press write',
        # Additional author names
        'denise brégand', 'brégand denise',
        'cédric mayrargue', 'mayrargue cédric',
        'limb peter', 'peter limb',
        'ulrike freitag', 'freitag ulrike',
        'klaas glenewinkel', 'glenewinkel klaas',
        'voir miran', 'miran voir',
        'voir glossair', 'glossair voir',
        'gilles holder', 'holder gilles',
        # Organizations and journal references
        'amnesty international', 'international amnesty',
        'special issue', 'issue special',
        'soir info', 'info soir',
        # Bibliographic noise
        'page consulter', 'consulter page',
    }

    bigrams = []
    for i in range(len(doc) - 1):
        t1, t2 = doc[i], doc[i + 1]

        # Skip if t1 is the second part of a hyphenated compound
        # (e.g. "faith-based" splits into "faith","-","based" — avoid "based X" bigrams)
        if i > 0 and doc[i - 1].text == '-':
            continue

        # Skip if either token is stopword, punct, or space
        if (t1.is_stop or t1.is_punct or t1.is_space or
            t2.is_stop or t2.is_punct or t2.is_space):
            continue

        if not (t1.is_alpha and t2.is_alpha):
            continue

        lemma1 = t1.lemma_.lower()
        lemma2 = t2.lemma_.lower()

        # Skip if either word is in custom stopwords
        if lemma1 in custom_stopwords or lemma2 in custom_stopwords:
            continue

        # Skip very short words (likely stopwords or abbreviations)
        if len(lemma1) < 3 or len(lemma2) < 3:
            continue

        bigram = f"{lemma1} {lemma2}"

        # Skip reference/citation patterns
        if bigram in reference_bigrams:
            continue

        bigrams.append(bigram)

    # Count and format
    counts = Counter(bigrams)
    return [
        {
            'ngram': ngram,
            'words': ngram.split(),
            'count': count,
        }
        for ngram, count in counts.most_common(top_n)
        if count >= 2
    ]


def get_output_dir() -> Path:
    """Get the output directory for analysis files."""
    script_dir = Path(__file__).parent
    return script_dir.parent / 'src' / 'lib' / 'data' / 'analysis' / 'publications'


def write_publication_file(
    publication_id: str,
    language: str,
    analysis: dict,
    bigrams: list,
    source: str = 'full-text'
) -> Path:
    """Write a single publication analysis to its own TypeScript file."""
    output_dir = get_output_dir()
    output_dir.mkdir(parents=True, exist_ok=True)

    today = date.today().isoformat()

    # Format frequencies
    freq_lines = []
    for f in analysis['frequencies']:
        pos_str = f", pos: '{f['pos']}'" if f.get('pos') else ''
        freq_lines.append(
            f"\t\t{{ word: '{f['word']}', count: {f['count']}, "
            f"lemma: '{f['lemma']}'{pos_str} }}"
        )

    # Format bigrams (top 30)
    bigram_lines = []
    for b in bigrams[:30]:
        words_str = json.dumps(b['words'])
        bigram_lines.append(
            f"\t\t{{ ngram: '{b['ngram']}', words: {words_str}, count: {b['count']} }}"
        )

    freq_content = ',\n'.join(freq_lines)
    bigram_content = ',\n'.join(bigram_lines)

    content = f"""/**
 * Text analysis for: {publication_id}
 * Auto-generated by scripts/analyze-publications.py
 */

import type {{ PublicationTextAnalysis }} from '$lib/types';

export const analysis: PublicationTextAnalysis = {{
\tpublicationId: '{publication_id}',
\tlanguage: '{language}',
\twordCount: {analysis['wordCount']},
\tuniqueWords: {analysis['uniqueWords']},
\tsource: '{source}',
\tanalyzedAt: '{today}',
\tfrequencies: [
{freq_content}
\t],
\tbigrams: [
{bigram_content}
\t]
}};
"""

    output_file = output_dir / f"{publication_id}.ts"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    return output_file


def get_analyzed_publication_count() -> int:
    """Count the number of analysis files (excluding index.ts)."""
    output_dir = get_output_dir()
    existing_files = list(output_dir.glob('*.ts'))
    return len([f for f in existing_files if f.stem != 'index'])


def process_single_file(
    file_path: Path,
    publication_id: str,
    language: str = 'en',
    model_size: str = 'lg',
    nlp=None,
    source: str = 'full-text'
) -> Path:
    """Process a single file and write TypeScript file. Returns output path."""
    print(f"  Processing: {file_path.name}")

    # Load NLP model if not provided (for batch efficiency)
    if nlp is None:
        nlp = load_spacy_model(language, model_size)

    custom_stopwords = CUSTOM_STOPWORDS_EN if language == 'en' else CUSTOM_STOPWORDS_FR

    # Extract and analyze text
    text = extract_text_from_file(file_path)
    analysis = analyze_text(text, language, nlp, custom_stopwords)
    bigrams = extract_bigrams(text, nlp, language)

    # Write output file
    output_path = write_publication_file(publication_id, language, analysis, bigrams, source)
    print(f"  -> Written: {output_path.name}")

    return output_path


def main():
    parser = argparse.ArgumentParser(
        description='Analyze publication texts for word cloud visualizations'
    )
    parser.add_argument(
        '--file', '-f',
        type=Path,
        help='Single file to process (PDF or TXT)'
    )
    parser.add_argument(
        '--id',
        type=str,
        help='Publication ID for the file'
    )
    parser.add_argument(
        '--language', '-l',
        type=str,
        default='en',
        choices=['en', 'fr'],
        help='Language of the text (default: en)'
    )
    parser.add_argument(
        '--model', '-m',
        type=str,
        default='lg',
        choices=['sm', 'md', 'lg', 'trf'],
        help='spaCy model size: sm (small), md (medium), lg (large/recommended), trf (transformer/best accuracy)'
    )
    parser.add_argument(
        '--batch', '-b',
        type=str,
        choices=['en', 'fr'],
        help='Process all files in scripts/texts/en or scripts/texts/fr'
    )

    args = parser.parse_args()

    # Auto-detect language from file path if not specified
    language = args.language
    if args.file:
        file_str = str(args.file)
        if '/texts/fr/' in file_str or '\\texts\\fr\\' in file_str:
            language = 'fr'
            print(f"Auto-detected language: French")
        elif '/texts/en/' in file_str or '\\texts\\en\\' in file_str:
            language = 'en'
            print(f"Auto-detected language: English")

    processed_ids = []

    if args.file and args.id:
        # Process single file
        print(f"\nProcessing single file...")
        process_single_file(
            args.file,
            args.id,
            language,
            args.model
        )
        processed_ids.append(args.id)

    elif args.batch:
        # Process all files in language folder
        scripts_dir = Path(__file__).parent
        texts_dir = scripts_dir / 'texts' / args.batch

        if not texts_dir.exists():
            print(f"Directory not found: {texts_dir}")
            exit(1)

        md_files = list(texts_dir.glob('*.md'))
        txt_files = list(texts_dir.glob('*.txt'))
        all_files = md_files + txt_files

        if not all_files:
            print(f"No .md or .txt files found in {texts_dir}")
            exit(1)

        print(f"\nFound {len(all_files)} files in {texts_dir}")
        print("=" * 60)

        # Load NLP model once for efficiency
        nlp = load_spacy_model(args.batch, args.model)

        for file_path in all_files:
            # Derive ID from filename (remove extension, convert to kebab-case)
            pub_id = file_path.stem.lower().replace(' ', '-').replace('_', '-')

            try:
                process_single_file(
                    file_path,
                    pub_id,
                    args.batch,
                    args.model,
                    nlp=nlp
                )
                processed_ids.append(pub_id)
            except Exception as e:
                print(f"  ERROR processing {file_path.name}: {e}")

    else:
        parser.print_help()
        exit(0)

    # Summary
    if processed_ids:
        print("\n" + "=" * 60)
        total_analyses = get_analyzed_publication_count()
        print(f"Done! Processed {len(processed_ids)} publication(s).")
        print(f"Total analyses available: {total_analyses}")
        print(f"Files written to: {get_output_dir()}")
        print(f"\nNote: index.ts uses import.meta.glob() to auto-load all analyses.")


if __name__ == '__main__':
    main()
