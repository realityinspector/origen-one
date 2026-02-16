import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../styles/theme';

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

interface GradePickerProps {
  value: string;               // Current grade value ("K", "1", "2", ... "12")
  onChange: (grade: string) => void;
  label?: string;              // Optional label text
  style?: any;                 // Optional container style override
}

const GradePicker: React.FC<GradePickerProps> = ({
  value,
  onChange,
  label = 'Grade Level',
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={style}>
      {label ? (
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {GRADES.map((grade) => {
          const selected = value === grade;
          return (
            <TouchableOpacity
              key={grade}
              activeOpacity={0.7}
              onPress={() => onChange(grade)}
              style={[
                styles.pill,
                selected
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: 'transparent', borderColor: colors.divider },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  selected
                    ? { color: colors.onPrimary }
                    : { color: colors.textPrimary },
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  pill: {
    minWidth: 48,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 12,
  },
  pillText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GradePicker;
