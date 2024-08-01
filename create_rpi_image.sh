sh ./create_release.sh

echo "making folder"
if [ ! -d /media/dwe/rootfs/opt/DWE_OS_2 ]; then
  sudo mkdir /media/dwe/rootfs/opt/DWE_OS_2
fi
echo "copying folder"
sudo cp -r release/* /media/dwe/rootfs/opt/DWE_OS_2

echo "creating startup script"

cp rpi-boot-script.sh /media/dwe/rootfs/etc/profile.d/DWE_OS_2.sh
cp /media/dwe/rootfs/opt/DWE_OS_2/service/dwe_os_2.service /media/dwe/rootfs/etc/systemd/dwe_os_2.service
sudo chmod 644 /media/dwe/rootfs/etc/systemd/dwe_os_2.service


echo "copying to ISO file"
echo "Check sudo fdisk -l to make sure the disk ends at 5144575"
sudo dd if=/dev/sda of=DWE_OS-raspbian.iso bs=512 status=progress count=5144575 conv=sparse
