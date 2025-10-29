import React, { forwardRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export interface RecipeActionsBottomSheetProps {
  onEditPress: () => void;
  onDeletePress: () => void;
}

/**
 * Bottom sheet component for recipe actions (Edit, Delete)
 * Uses @gorhom/bottom-sheet for smooth animations
 */
export const RecipeActionsBottomSheet = forwardRef<BottomSheet, RecipeActionsBottomSheetProps>(
  ({ onEditPress, onDeletePress }, ref) => {
    // Define snap points
    const snapPoints = useMemo(() => ['25%', '50%'], []);

    // Render custom backdrop with dismiss on tap
    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    // Handle edit action
    const handleEditPress = useCallback(() => {
      // Close the bottom sheet
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
      // Call the callback after a short delay to allow animation
      setTimeout(() => {
        onEditPress();
      }, 100);
    }, [onEditPress, ref]);

    // Handle delete action
    const handleDeletePress = useCallback(() => {
      // Close the bottom sheet
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
      // Call the callback after a short delay to allow animation
      setTimeout(() => {
        onDeletePress();
      }, 100);
    }, [onDeletePress, ref]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Actions</Text>

          {/* Edit Recipe Action */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="edit"
                size={24}
                color="#007AFF"
                testID="edit-icon"
              />
            </View>
            <Text style={styles.actionText}>Edit Recipe</Text>
          </TouchableOpacity>

          {/* Delete Recipe Action */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleDeletePress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons
                name="delete"
                size={24}
                color="#FF3B30"
                testID="delete-icon"
              />
            </View>
            <Text style={[styles.actionText, styles.deleteText]}>Delete Recipe</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    );
  }
);

RecipeActionsBottomSheet.displayName = 'RecipeActionsBottomSheet';

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  deleteText: {
    color: '#FF3B30',
  },
});
