import { ThemeContext } from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const { theme } = useContext(ThemeContext);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    if (currentPage > 2) {
      pageNumbers.push(
        <TouchableOpacity
          key={1}
          style={[
            styles.pageButton,
            {
              backgroundColor:
                currentPage === 1
                  ? theme.colors.secondary
                  : theme.colors.primary,
            },
          ]}
          onPress={() => handlePageChange(1)}
        >
          <Text
            style={[
              styles.pageButtonText,
              {
                color:
                  currentPage === 1 ? theme.colors.primary : theme.colors.dark,
              },
            ]}
          >
            1
          </Text>
        </TouchableOpacity>
      );

      if (currentPage > 3) {
        pageNumbers.push(
          <Text key="start-ellipsis" style={styles.ellipsisText}>
            ...
          </Text>
        );
      }
    }

    pageNumbers.push(
      <TouchableOpacity
        key={currentPage}
        style={[
          styles.pageButton,
          {
            backgroundColor: theme.colors.secondary,
          },
        ]}
        onPress={() => handlePageChange(currentPage)}
      >
        <Text
          style={[
            styles.pageButtonText,
            {
              color: theme.colors.primary,
            },
          ]}
        >
          {currentPage}
        </Text>
      </TouchableOpacity>
    );

    if (currentPage < totalPages - 2) {
      pageNumbers.push(
        <Text key="end-ellipsis" style={styles.ellipsisText}>
          ...
        </Text>
      );
    }

    if (currentPage < totalPages) {
      pageNumbers.push(
        <TouchableOpacity
          key={totalPages}
          style={[
            styles.pageButton,
            {
              backgroundColor:
                currentPage === totalPages
                  ? theme.colors.secondary
                  : theme.colors.primary,
            },
          ]}
          onPress={() => handlePageChange(totalPages)}
        >
          <Text
            style={[
              styles.pageButtonText,
              {
                color:
                  currentPage === totalPages
                    ? theme.colors.primary
                    : theme.colors.dark,
              },
            ]}
          >
            {totalPages}
          </Text>
        </TouchableOpacity>
      );
    }

    return pageNumbers;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.dark }]}
        onPress={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <MaterialCommunityIcons
          name={"chevron-left"}
          color={"white"}
          size={25}
          left={-3}
        />
      </TouchableOpacity>
      {renderPageNumbers()}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.dark }]}
        onPress={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <MaterialCommunityIcons
          name={"chevron-right"}
          color={"white"}
          size={25}
          left={-2}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  button: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 15,
    width:40
  },
  pageButton: {
    padding: 12,
    marginHorizontal: 2,
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  pageButtonText: {
    fontSize: 16,
  },
  ellipsisText: {
    color: "#000",
    fontSize: 25,
    marginHorizontal: 5,
  },
});

export default Pagination;
