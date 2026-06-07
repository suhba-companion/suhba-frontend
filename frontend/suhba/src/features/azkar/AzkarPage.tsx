import { useAzkar } from './useAzkar'
import { AzkarNavCards } from './AzkarNavCards'
import { AzkarSection } from './AzkarSection'

export function AzkarPage(): JSX.Element {
  const { activeTab, setTab, dhikrList, duaaList, sabahList, masaList } = useAzkar()

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-4 space-y-4">
        <AzkarNavCards activeTab={activeTab} setTab={setTab} />
        <AzkarSection
          activeTab={activeTab}
          setTab={setTab}
          dhikrList={dhikrList}
          duaaList={duaaList}
          sabahList={sabahList}
          masaList={masaList}
        />
      </div>
    </div>
  )
}
