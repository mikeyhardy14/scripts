import pandas as pd

# Example dataframes
df1 = pd.DataFrame({
    'platform_1': ['A', 'B', 'C'],
    'node_1': ['X', 'Y', 'Z']
})

df2 = pd.DataFrame({
    'platform_2': ['Apple', 'Banana', 'Cherry'],
    'node_2': ['Xylophone', 'Yellow', 'Zebra']
})

# Example mappings for platform and node names
platform_mapping = {'A': 'Apple', 'B': 'Banana', 'C': 'Cherry'}
node_mapping = {'X': 'Xylophone', 'Y': 'Yellow', 'Z': 'Zebra'}

# Standardize platform and node names in both dataframes
df1['standard_platform'] = df1['platform_1'].map(platform_mapping)
df1['standard_node'] = df1['node_1'].map(node_mapping)

df2['standard_platform'] = df2['platform_2']
df2['standard_node'] = df2['node_2']

# Create sets of standardized platform-node combinations
set1 = set(zip(df1['standard_platform'], df1['standard_node']))
set2 = set(zip(df2['standard_platform'], df2['standard_node']))

# Find missing combinations
missing_in_df1 = set2 - set1  # Items in df2 but not in df1
missing_in_df2 = set1 - set2  # Items in df1 but not in df2

# Convert results back to dataframes for better readability
missing_in_df1_df = pd.DataFrame(list(missing_in_df1), columns=['platform', 'node'])
missing_in_df2_df = pd.DataFrame(list(missing_in_df2), columns=['platform', 'node'])

# Display results
import ace_tools as tools; tools.display_dataframe_to_user(name="Missing in DF1", dataframe=missing_in_df1_df)
tools.display_dataframe_to_user(name="Missing in DF2", dataframe=missing_in_df2_df)