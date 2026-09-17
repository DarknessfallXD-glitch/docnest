'use client';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components';
import { useDocuments } from '@/hooks/useAppStore';
import { useTheme, colors } from '@/hooks/useTheme';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { useAppStore } from '@/hooks/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  extraLarge: 20,
};

const FONT_FAMILIES = {
  system: 'Inter-Regular',
  monospace: 'Menlo-Regular',
  serif: 'Georgia',
};

const LINE_SPACING_OPTIONS = [1.2, 1.5, 1.8, 2.0, 2.5];

interface ReadingHistory {
  id: string;
  document_id: string;
  scroll_position: number;
  total_height: number;
  progress: number;
  font_size: string;
  line_spacing: number;
  font_family: string;
  theme: string;
  updated_at: number;
}

export default function TXTViewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const { documents, refreshAll } = useDocuments();
  const [isLoading, setIsLoading] = useState(true);
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<keyof typeof FONT_SIZES>('medium');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [fontFamily, setFontFamily] = useState<keyof typeof FONT_FAMILIES>('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [matches, setMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [selectedText, setSelectedText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeightRef = useRef(0);
  const dbRef = useRef<SQLite.SQLiteDatabase | null>(null);

  const document = documents.find(d => d.id === id);

  const getDb = async () => {
    if (dbRef.current) return dbRef.current;
    dbRef.current = await SQLite.openDatabaseAsync('docnest.db');
    return dbRef.current;
  };

  const loadReadingHistory = useCallback(async () => {
    if (!id) return;
    try {
      const db = await getDb();
      const row = await db.getFirstAsync<ReadingHistory>(
        'SELECT * FROM reading_history WHERE document_id = ?',
        [id]
      );
      if (row) {
        setFontSize(row.font_size as keyof typeof FONT_SIZES);
        setLineSpacing(row.line_spacing);
        setFontFamily(row.font_family as keyof typeof FONT_FAMILIES);
        return row;
      }
    } catch (e) {
      console.warn('Failed to load reading history:', e);
    }
    return null;
  }, [id]);

  const saveReadingHistory = useCallback(async (scrollPos: number, totalHeight: number, prog: number) => {
    if (!id) return;
    try {
      const db = await getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO reading_history 
         (id, document_id, scroll_position, total_height, progress, font_size, line_spacing, font_family, theme, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          id,
          scrollPos,
          totalHeight,
          prog,
          fontSize,
          lineSpacing,
          fontFamily,
          isDark ? 'dark' : 'light',
          Date.now(),
        ]
      );
    } catch (e) {
      console.warn('Failed to save reading history:', e);
    }
  }, [id, fontSize, lineSpacing, fontFamily, isDark]);

  const loadDocument = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const doc = documents.find(d => d.id === id);
      if (!doc) {
        await refreshAll();
      }

      const content = await FileSystem.readAsStringAsync(doc?.uri || '');
      setTextContent(content);

      const history = await loadReadingHistory();
      if (history) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: history.scroll_position, animated: false });
        }, 100);
      }
    } catch (e) {
      setError('Failed to load text file');
      console.error('Error loading text file:', e);
    } finally {
      setIsLoading(false);
    }
  }, [id, documents, refreshAll, loadReadingHistory]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    if (searchQuery) {
      const indices: number[] = [];
      const lowerContent = textContent.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      let index = lowerContent.indexOf(lowerQuery);
      while (index !== -1) {
        indices.push(index);
        index = lowerContent.indexOf(lowerQuery, index + 1);
      }
      setMatches(indices);
      setCurrentMatchIndex(indices.length > 0 ? 0 : -1);
      if (indices.length > 0) {
        scrollToMatch(indices[0]);
      }
    } else {
      setMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [searchQuery, textContent]);

  const scrollToMatch = (index: number) => {
    const lineHeight = FONT_SIZES[fontSize] * lineSpacing;
    const charsPerLine = Math.floor((SCREEN_WIDTH - 32) / (FONT_SIZES[fontSize] * 0.6));
    const lineNumber = Math.floor(index / charsPerLine);
    const yPosition = lineNumber * lineHeight;
    scrollViewRef.current?.scrollTo({ y: yPosition, animated: true });
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const totalHeight = contentHeightRef.current || event.nativeEvent.contentSize.height;
    contentHeightRef.current = totalHeight;
    const prog = totalHeight > SCREEN_HEIGHT ? y / (totalHeight - SCREEN_HEIGHT) : 0;
    setProgress(Math.min(Math.max(prog, 0), 1));
    saveReadingHistory(y, totalHeight, prog);
  };

  const handleContentLayout = (event: any) => {
    contentHeightRef.current = event.nativeEvent.layout.height;
  };

  const handleTextSelect = (event: any) => {
    const text = event.nativeEvent.text;
    if (text) {
      setSelectedText(text);
    }
  };

  const copySelectedText = async () => {
    if (selectedText) {
      await Clipboard.setStringAsync(selectedText);
      Alert.alert('Copied', 'Text copied to clipboard');
      setSelectedText('');
    }
  };

  const shareSelectedText = async () => {
    if (selectedText && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(selectedText, { mimeType: 'text/plain', dialogTitle: 'Share text' });
      setSelectedText('');
    }
  };

  const shareFullText = async () => {
    if (textContent && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(textContent, { mimeType: 'text/plain', dialogTitle: 'Share document' });
    }
  };

  const copyFullText = async () => {
    await Clipboard.setStringAsync(textContent);
    Alert.alert('Copied', 'Full document copied to clipboard');
  };

  const selectAllText = () => {
    setSelectedText(textContent);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const navigateMatch = (direction: 'prev' | 'next') => {
    if (matches.length === 0) return;
    let newIndex = currentMatchIndex;
    if (direction === 'next') {
      newIndex = (currentMatchIndex + 1) % matches.length;
    } else {
      newIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    }
    setCurrentMatchIndex(newIndex);
    scrollToMatch(matches[newIndex]);
  };

  const highlightText = (text: string) => {
    if (!searchQuery) return [<Text key="0" selectable={true} onTextLayout={handleTextSelect}>{text}</Text>];

    const parts: React.ReactNode[] = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    let lastIndex = 0;
    let matchIndex = 0;

    while (true) {
      const index = lowerText.indexOf(lowerQuery, lastIndex);
      if (index === -1) break;

      if (index > lastIndex) {
        parts.push(<Text key={`text-${matchIndex}`} selectable={true} onTextLayout={handleTextSelect}>{text.substring(lastIndex, index)}</Text>);
      }

      parts.push(
        <Text
          key={`match-${matchIndex}`}
          style={[
            styles.highlight,
            matchIndex === currentMatchIndex && styles.currentMatch,
            { backgroundColor: matchIndex === currentMatchIndex ? themeColors.primary : themeColors.tertiaryContainer }
          ]}
          selectable={true}
          onTextLayout={handleTextSelect}
        >
          {text.substring(index, index + searchQuery.length)}
        </Text>
      );

      lastIndex = index + searchQuery.length;
      matchIndex++;
    }

    if (lastIndex < text.length) {
      parts.push(<Text key={`text-${matchIndex}`} selectable={true} onTextLayout={handleTextSelect}>{text.substring(lastIndex)}</Text>);
    }

    return parts.length > 0 ? parts : [<Text key="0" selectable={true} onTextLayout={handleTextSelect}>{text}</Text>];
  };

  const toggleTheme = () => {
    const { setSettings } = useAppStore.getState();
    setSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const incrementFontSize = () => {
    const sizes: (keyof typeof FONT_SIZES)[] = ['small', 'medium', 'large', 'extraLarge'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  const decrementFontSize = () => {
    const sizes: (keyof typeof FONT_SIZES)[] = ['small', 'medium', 'large', 'extraLarge'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const cycleLineSpacing = () => {
    const currentIndex = LINE_SPACING_OPTIONS.indexOf(lineSpacing);
    const nextIndex = (currentIndex + 1) % LINE_SPACING_OPTIONS.length;
    setLineSpacing(LINE_SPACING_OPTIONS[nextIndex]);
  };

  const cycleFontFamily = () => {
    const families: (keyof typeof FONT_FAMILIES)[] = ['system', 'monospace', 'serif'];
    const currentIndex = families.indexOf(fontFamily);
    const nextIndex = (currentIndex + 1) % families.length;
    setFontFamily(families[nextIndex]);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Feather name="loader" size={32} color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading document...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!document) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Text Viewer" leftAction={{ icon: 'chevron-left', onPress: () => router.back() }} />
        <View style={styles.notFound}>
          <Feather name="alert-triangle" size={48} color={themeColors.onSurfaceVariant} />
          <Text style={styles.notFoundText}>Document not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Text Viewer" leftAction={{ icon: 'chevron-left', onPress: () => router.back() }} />
        <View style={styles.error}>
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load document</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentFontSize = FONT_SIZES[fontSize];
  const currentFontFamily = FONT_FAMILIES[fontFamily];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title={document.name}
        leftAction={{ icon: 'chevron-left', onPress: () => router.back() }}
        rightActions={[
          { icon: showSearch ? 'x' : 'search', onPress: () => setShowSearch(!showSearch), accessibilityLabel: showSearch ? 'Close search' : 'Search' },
          { icon: 'share-2', onPress: shareFullText, accessibilityLabel: 'Share document' },
          { icon: isDark ? 'sun' : 'moon', onPress: toggleTheme, accessibilityLabel: isDark ? 'Light mode' : 'Dark mode' },
        ]}
      />

      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: themeColors.surface }]}>
          <Feather name="search" size={20} color={themeColors.onSurfaceVariant} style={styles.searchIcon} />
          <Text
            style={[
              styles.searchInput,
              { color: themeColors.onSurface, placeholderTextColor: themeColors.onSurfaceVariant }
            ]}
            placeholder="Search in document..."
            onChangeText={handleSearchChange}
            value={searchQuery}
            autoFocus
            onSubmitEditing={() => navigateMatch('next')}
          />
          {matches.length > 0 && (
            <View style={styles.searchInfo}>
              <Text style={[styles.searchCount, { color: themeColors.onSurfaceVariant }]}>
                {currentMatchIndex + 1} of {matches.length}
              </Text>
              <TouchableOpacity onPress={() => navigateMatch('prev')} style={styles.searchNav} accessibilityLabel="Previous match">
                <Feather name="chevron-up" size={18} color={themeColors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateMatch('next')} style={styles.searchNav} accessibilityLabel="Next match">
                <Feather name="chevron-down" size={18} color={themeColors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSearchClose} style={styles.searchNav} accessibilityLabel="Close search">
                <Feather name="x" size={18} color={themeColors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        onContentSizeChange={handleContentLayout}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      >
        <Text
          style={[
            styles.textContent,
            {
              fontSize: currentFontSize,
              lineHeight: currentFontSize * lineSpacing,
              fontFamily: currentFontFamily,
              color: themeColors.onBackground,
            },
          ]}
          selectable={true}
          onTextLayout={handleTextSelect}
        >
          {highlightText(textContent)}
        </Text>
      </ScrollView>

      {progress > 0 && progress < 1 && showToolbar && (
        <View style={[styles.progressContainer, { backgroundColor: themeColors.surface }]}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: themeColors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: themeColors.onSurfaceVariant }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}

      {showToolbar && (
        <View style={[styles.toolbar, { backgroundColor: themeColors.surface }]}>
          <View style={styles.toolbarSection}>
            <TouchableOpacity onPress={decrementFontSize} style={styles.toolbarButton} accessibilityLabel="Decrease font size">
              <Feather name="minus" size={20} color={themeColors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.toolbarText, { color: themeColors.onSurface }]}>{fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}</Text>
            <TouchableOpacity onPress={incrementFontSize} style={styles.toolbarButton} accessibilityLabel="Increase font size">
              <Feather name="plus" size={20} color={themeColors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.toolbarDivider} />

          <View style={styles.toolbarSection}>
            <TouchableOpacity onPress={cycleLineSpacing} style={styles.toolbarButton} accessibilityLabel={`Line spacing: ${lineSpacing}`}>
              <Feather name="type" size={20} color={themeColors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.toolbarText, { color: themeColors.onSurface }]}>{lineSpacing}</Text>
          </View>

          <View style={styles.toolbarDivider} />

          <View style={styles.toolbarSection}>
            <TouchableOpacity onPress={cycleFontFamily} style={styles.toolbarButton} accessibilityLabel={`Font: ${fontFamily}`}>
              <Feather name="font" size={20} color={themeColors.onSurface} />
            </TouchableOpacity>
            <Text style={[styles.toolbarText, { color: themeColors.onSurface }]}>{fontFamily.charAt(0).toUpperCase() + fontFamily.slice(1)}</Text>
          </View>

          <View style={styles.toolbarDivider} />

          <View style={styles.toolbarSection}>
            <TouchableOpacity onPress={shareFullText} style={styles.toolbarButton} accessibilityLabel="Share document">
              <Feather name="share-2" size={20} color={themeColors.onSurface} />
            </TouchableOpacity>
            <TouchableOpacity onPress={copyFullText} style={styles.toolbarButton} accessibilityLabel="Copy document">
              <Feather name="copy" size={20} color={themeColors.onSurface} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selectedText && (
        <View style={[styles.selectionToolbar, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.selectionText, { color: themeColors.onSurface }]}>
            "{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity onPress={copySelectedText} style={styles.selectionButton} accessibilityLabel="Copy selection">
              <Text style={[styles.selectionButtonText, { color: themeColors.primary }]}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareSelectedText} style={styles.selectionButton} accessibilityLabel="Share selection">
              <Text style={[styles.selectionButtonText, { color: themeColors.primary }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={selectAllText} style={styles.selectionButton} accessibilityLabel="Select all">
              <Text style={[styles.selectionButtonText, { color: themeColors.primary }]}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedText('')} style={styles.selectionButton} accessibilityLabel="Clear selection">
              <Text style={[styles.selectionButtonText, { color: themeColors.error }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.light.onSurfaceVariant,
    textAlign: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: colors.light.onSurfaceVariant,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  textContent: {
    textAlign: 'left',
  },
  highlight: {
    borderRadius: 2,
    paddingHorizontal: 2,
  },
  currentMatch: {
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.outlineVariant,
  },
  searchIcon: {
    marginLeft: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    height: 40,
  },
  searchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchCount: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    minWidth: 80,
    textAlign: 'center',
  },
  searchNav: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.light.outlineVariant,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    minWidth: 40,
    textAlign: 'right',
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light.outlineVariant,
  },
  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.light.outlineVariant,
  },
  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    minWidth: 50,
    textAlign: 'center',
  },
  selectionToolbar: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  selectionText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});