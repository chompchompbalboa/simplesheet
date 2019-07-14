<?php

use Illuminate\Database\Seeder;

class OrganizationTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
      // User
      $userFolder = factory(App\Models\Folder::class)->create([ 'name' => 'Rocky' ]);
      $users = factory(App\Models\User::class)->create([ 
        'id' => '75e3c4f9-b261-3343-a320-8ee9fb0c931e', 
        'folderId' => $userFolder->id 
      ])->each(function($user) {

        // User Active + Color + Layout
        $user->active()->save(factory(App\Models\UserActive::class)->make());
        $user->color()->save(factory(App\Models\UserColor::class)->make());
        $user->layout()->save(factory(App\Models\UserLayout::class)->make());

        // Organization
        $organizationFolder = factory(App\Models\Folder::class)->create([ 'name' => 'Dillon Works' ]);
        $organization = factory(App\Models\Organization::class)->create([
          'folderId' => $organizationFolder->id
        ])->each(function($organization) use($organizationFolder, $user) {
          $user->organizationId = $organization->id;
          $user->save();

          // Organization Folders
          factory(App\Models\Folder::class, 10)->create()->each(function ($folder, $folderKey) use($organizationFolder) {
            $folder->folderId = $organizationFolder->id;
            $folder->name = 'Folder '.($folderKey + 1);
            $folder->save();

            // Files
            factory(App\Models\File::class, 5)->create()->each(function ($file, $fileKey) use($folder, $folderKey) {
              $file->folderId = $folder->id;
              $file->name = 'File '.($folderKey + 1).'.'.($fileKey + 1);
              $file->save();

              // File types
              $fileTypes = ['SHEET'];
              $fileType = $fileTypes[array_rand($fileTypes, 1)];
              switch($fileType) {

                // Sheets
                case 'SHEET': 
                  $sheets = factory(App\Models\Sheet::class, 1)->create();
                  $sheets->each(function($sheet) use ($file) {

                    $file->type = 'SHEET';
                    $file->typeId = $sheet->id;
                    $file->save();

                    // Columns
                    $columns = factory(App\Models\SheetColumn::class, 3)->create();
                    $columns->each(function($column, $key) use ($sheet) {
                      $column->sheetId = $sheet->id;
                      $column->position = $key;
                      $column->save();
                    });

                    // Rows
                    $rows = factory(App\Models\SheetRow::class, 10)->create();
                    $rows->each(function($row) use($columns, $sheet) {
                      $row->sheetId = $sheet->id;
                      $row->save();

                      // Cells
                      $columns->each(function($column) use($row, $sheet) {
                        $cell = factory(App\Models\SheetCell::class)->create();
                        $cell->sheetId = $sheet->id;
                        $cell->rowId = $row->id;
                        $cell->columnId = $column->id;
                        $cell->save();
                      });
                    });
                  });
                break;
              }
            });
          });
        });
      });
    }
}
