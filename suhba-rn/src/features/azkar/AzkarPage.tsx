import { ScrollView, StyleSheet } from 'react-native'
import { useAzkar } from './useAzkar'
import { AzkarNavCards } from './AzkarNavCards'
import { AzkarSection } from './AzkarSection'

export function AzkarPage({ footer }: { footer?: React.ReactNode }): React.JSX.Element {
  const { activeTab, setTab, dhikrList, duaaList, sabahList, masaList } = useAzkar()

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AzkarNavCards activeTab={activeTab} setTab={setTab} />
      <AzkarSection
        activeTab={activeTab}
        setTab={setTab}
        dhikrList={dhikrList}
        duaaList={duaaList}
        sabahList={sabahList}
        masaList={masaList}
      />
      {footer}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
})
