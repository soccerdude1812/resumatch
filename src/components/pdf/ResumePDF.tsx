'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// ---- Types ----

interface ResumePDFProps {
  resumeText: string;
}

interface ResumeSection {
  title: string;
  content: string;
}

// ---- Styles ----

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,    // ~0.75 inch
    paddingBottom: 54,
    paddingLeft: 54,
    paddingRight: 54,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563eb',
    paddingBottom: 8,
  },
  nameText: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  contactLine: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingBottom: 2,
  },
  sectionContent: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 12,
    fontSize: 10,
    color: '#6b7280',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  paragraph: {
    marginBottom: 4,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
});

// ---- Section Headers ----

const SECTION_HEADERS = [
  'SUMMARY',
  'PROFESSIONAL SUMMARY',
  'OBJECTIVE',
  'EXPERIENCE',
  'WORK EXPERIENCE',
  'PROFESSIONAL EXPERIENCE',
  'EMPLOYMENT',
  'EMPLOYMENT HISTORY',
  'EDUCATION',
  'SKILLS',
  'TECHNICAL SKILLS',
  'CORE COMPETENCIES',
  'CERTIFICATIONS',
  'CERTIFICATES',
  'PROJECTS',
  'AWARDS',
  'HONORS',
  'PUBLICATIONS',
  'VOLUNTEER',
  'VOLUNTEER EXPERIENCE',
  'LANGUAGES',
  'INTERESTS',
  'REFERENCES',
  'ACTIVITIES',
  'ADDITIONAL INFORMATION',
  'PROFILE',
];

// ---- Parsing Logic ----

function isSectionHeader(line: string): boolean {
  const normalized = line.trim().toUpperCase().replace(/[:\-_]/g, '').trim();
  return SECTION_HEADERS.some(
    (header) => normalized === header || normalized.startsWith(header + ' ')
  );
}

function parseResumeSections(text: string): {
  header: string[];
  sections: ResumeSection[];
} {
  const lines = text.split('\n');
  const headerLines: string[] = [];
  const sections: ResumeSection[] = [];
  let currentSection: ResumeSection | null = null;
  let foundFirstSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (isSectionHeader(trimmed)) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      foundFirstSection = true;
      currentSection = {
        title: trimmed.replace(/[:\-]/g, '').trim(),
        content: '',
      };
    } else if (!foundFirstSection) {
      // Lines before the first section header = name / contact info
      if (trimmed.length > 0) {
        headerLines.push(trimmed);
      }
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  // Push the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections were found, treat the entire text as a single section
  if (sections.length === 0) {
    sections.push({
      title: '',
      content: text,
    });
  }

  return { header: headerLines, sections };
}

function renderSectionContent(content: string) {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const bulletMatch = line.match(/^[\u2022\u2023\u25E6\u25CF\u25CB\-\*]\s*(.*)/);

    if (bulletMatch) {
      elements.push(
        <View key={`bullet-${i}`} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>{'\u2022'}</Text>
          <Text style={styles.bulletText}>{bulletMatch[1]}</Text>
        </View>
      );
    } else {
      elements.push(
        <Text key={`para-${i}`} style={styles.paragraph}>
          {line}
        </Text>
      );
    }
  }

  return elements;
}

// ---- Component ----

export default function ResumePDF({ resumeText }: ResumePDFProps) {
  const { header, sections } = parseResumeSections(resumeText);

  return (
    <Document title="Tailored Resume" author="ResuMatch">
      <Page size="LETTER" style={styles.page}>
        {/* Header: Name and Contact */}
        {header.length > 0 && (
          <View style={styles.header}>
            {header[0] && (
              <Text style={styles.nameText}>{header[0]}</Text>
            )}
            {header.slice(1).map((line, idx) => (
              <Text key={`contact-${idx}`} style={styles.contactLine}>
                {line}
              </Text>
            ))}
          </View>
        )}

        {/* Sections */}
        {sections.map((section, idx) => (
          <View key={`section-${idx}`} style={styles.sectionContainer}>
            {section.title && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            <View>{renderSectionContent(section.content)}</View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
