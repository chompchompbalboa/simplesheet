<?php

namespace App\Utils;

use App\Utils\Csv;
use Illuminate\Support\Str;

use App\Models\SheetColumn;
use App\Models\SheetRow;
use App\Models\SheetCell;
use App\Models\SheetView;

class SheetBuilder
{
  
  protected $SHEET_SETTINGS_FLAG = '[TS]';


  public function applyColumnSettings(array $columnIds, array $allColumnSettings) {
    foreach($columnIds as $index => $columnId) {
      if($columnId !== 'COLUMN_BREAK') {
        $sheetColumn = SheetColumn::find($columnId);
        $columnSettings = $allColumnSettings[$index];
        if(array_key_exists('CELL_TYPE', $columnSettings)) { $sheetColumn->typeId = $columnSettings['CELL_TYPE']; }
        if(array_key_exists('WIDTH', $columnSettings)) { $sheetColumn->width = $columnSettings['WIDTH']; }
        $sheetColumn->save();
      }
    }
  }


  public static function createSheetColumnsRowsAndCellsFromCsvRows($newSheet, $arrayOfRows) {
    // Create the sheet's columns by building an array that will be bulk 
    // inserted into the database. During column creation, we also build 
    // the sheet view's visible columns
    $newSheetColumns = [];
    $columnIds = [];
    $currentColumnIndex = 0;
    foreach($arrayOfRows[0] as $columnName => $cellValue) {
      // Bail out if the current column is a column break
      if(!Str::contains($columnName, 'COLUMN_BREAK')) {
        // Create the new column.
        $newColumnId = Str::uuid()->toString();
        $nextColumnWidth = max(50, strlen($columnName) * 8);
        array_push($newSheetColumns, [
          'id' => $newColumnId,
          'sheetId' => $newSheet->id,
          'name' => $columnName,
          'typeId' => SheetUtils::getColumnType($cellValue),
          'width' => $nextColumnWidth
        ]);

        // Add the new column id to the sheet view's visible columns
        $columnIds[$currentColumnIndex] = $newColumnId;
      }
      else {
        // If it is a column break, add it to the sheet view's visible columns
        $columnIds[$currentColumnIndex] = 'COLUMN_BREAK';
      }
      $currentColumnIndex++;
    }

    // Create the sheet's row and cell's by building an array that will be 
    // bulk inserted into the database. 
    $newSheetRows = [];
    $newSheetCells = [];
    foreach($arrayOfRows as $rowFromCsv) {

      // Bail out if this row contains configuration data
      $firstCellValue = $rowFromCsv[array_keys($rowFromCsv)[0]];
      if(!Str::contains($firstCellValue, '[TS]')) {

        // Create the new row
        $newRowId = Str::uuid()->toString();
        array_push($newSheetRows, [ 
          'id' => $newRowId,
          'sheetId' => $newSheet->id 
        ]);

        // Create the new cells
        foreach($newSheetColumns as $index => $column) {
          $cellValue = $rowFromCsv[$column['name']];
          array_push($newSheetCells, [
            'id' => Str::uuid()->toString(),
            'sheetId' => $newSheet->id,
            'columnId' => $column['id'],
            'rowId' => $newRowId,
            'value' => $cellValue
          ]);
          $cellValueLength = strlen($cellValue);
          $defaultColumnWidth = $newSheetColumns[$index]['width'];
          $newColumnWidth = min(300, max($cellValueLength * 8, $defaultColumnWidth));
          $newSheetColumns[$index]['width'] = $newColumnWidth;
        }
      }
    }

    // Save the sheet columns
    SheetColumn::insert($newSheetColumns);

    // Save the sheet rows
    foreach (array_chunk($newSheetRows, 2500) as $chunk) {
      SheetRow::insert($chunk);
    }

    // Save the sheet cells
    foreach (array_chunk($newSheetCells, 2500) as $chunk) {
      SheetCell::insert($chunk);
    }  

    return $columnIds;
  }

  
  public function createSheetViews(string $sheetId, array $visibleColumns, array $sheetViewsSettings) {
    $newSheetViewIds = [];
    foreach($sheetViewsSettings as $sheetViewSettings) {
      $sheetViewName = $this->getSheetViewName($sheetViewSettings);
      // Create the sheet view
      $newSheetView = SheetView::create([ 
        'id' => Str::uuid()->toString(), 
        'sheetId' => $sheetId,
        'name' => $sheetViewName,
        'isLocked' => false,
        'visibleColumns' => $visibleColumns
      ]);
      array_push($newSheetViewIds, $newSheetView->id);
    }
    return $newSheetViewIds;
  }
  
    
  public function getCsvRows($csvFile) {
    return Csv::toArray($csvFile);
  }
  
  
  public function getColumnSettings(array $csvRows) {
    $firstRow = $csvRows[0]; // Column settings are always stored in the first row
    $firstRowFirstCell = $firstRow[array_keys($firstRow)[0]];
    $doesCsvContainColumnSettings = Str::contains($firstRowFirstCell, $this->SHEET_SETTINGS_FLAG);
    
    if($doesCsvContainColumnSettings) {
      $columnSettings = [];
      foreach($firstRow as $currentCell) {
        $settingsInCurrentCell = $this->getSheetSettingsFromCell($currentCell);
        array_push($columnSettings, $settingsInCurrentCell);
      }
      return $columnSettings;
    }
    else {
      return null;
    }
  }

  
  public function getSheetViewName(array $sheetViewSettings) {
    // The sheet view name is always included in the first cell of the row where the settings are stored
    return $sheetViewSettings[0]['SHEET_VIEW_NAME'];
  }
  
  
  public function getSheetViewsSettings(array $csvRows) {
    $doesCsvContainColumnSettings = $this->getColumnSettings($csvRows) !== null;
    $currentRowIndex = $doesCsvContainColumnSettings ? 1 : 0;
    $currentRowContainsSheetViewSettings = true;
    $sheetViewsSettings = [];
    
    while($currentRowContainsSheetViewSettings) {
      $currentRow = $csvRows[$currentRowIndex];
      $currentRowFirstCellValue = $currentRow[array_keys($currentRow)[0]];
      
      if(Str::contains($currentRowFirstCellValue, $this->SHEET_SETTINGS_FLAG)
        && Str::contains($currentRowFirstCellValue, 'SHEET_VIEW')
      ) {
        $currentRowSheetViewSettings = [];
        
        foreach($currentRow as $currentCell) {
          $settingsInCurrentCell = $this->getSheetSettingsFromCell($currentCell);
          array_push($currentRowSheetViewSettings, $settingsInCurrentCell);
        }
        array_push($sheetViewsSettings, $currentRowSheetViewSettings);
        $currentRowIndex++;
      }
      else {
        $currentRowContainsSheetViewSettings = false;
      }
    }
    
    return count($sheetViewsSettings) > 0 ? $sheetViewsSettings : null;
  }
  

  private function getSheetSettingsFromCell(string $cellValue) {
    // Remove the sheet settings flag
    $rawSettingsString = str_replace($this->SHEET_SETTINGS_FLAG, '', $cellValue);
    // Split the string using the end bracket as a delimiter
    $rawSettingsArray = explode(']', $rawSettingsString);
    // If there are settings in the cell
    if(count($rawSettingsArray) > 0) {
      $sheetSettings = [];
      foreach($rawSettingsArray as $rawSetting) {
        // Remove the start bracket from the string
        $rawSettingString = str_replace('[', '', $rawSetting);
        // Split the setting into its key and value using the equal sign as a delimiter
        $rawSettingArray = explode('=', $rawSettingString);
        // If the sheet setting exists
        if(count($rawSettingArray) > 1) {
          // Set the sheet setting key
          $sheetSettingKey = $rawSettingArray[0];
          // Set the sheet setting value
          if(count($rawSettingArray) > 2) {
            // If the sheet setting contains an equal sign, rebuild the string
            array_shift($rawSettingArray);
            $sheetSettingValue = implode('=', $rawSettingArray);
          }
          else {
            $sheetSettingValue = $rawSettingArray[1];
          }
          // Store the sheet setting to the return array
          $sheetSettings[$sheetSettingKey] = $sheetSettingValue;
        }
      }
      return $sheetSettings;
    }
    else {
      return null;
    }
  }
}
